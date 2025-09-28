/**
 * Comprehensive error handling middleware for API routes
 */
import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/utils/error-handler';
import { monitoring } from '@/lib/utils/monitoring';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  requestId?: string;
}

// Generate unique request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Log error with context
function logError(
  error: unknown,
  context: {
    requestId: string;
    path: string;
    method: string;
    userAgent?: string;
    ip?: string;
  },
) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context.requestId}] API Error:`, {
    message: errorMessage,
    stack: errorStack,
    path: context.path,
    method: context.method,
    userAgent: context.userAgent,
    ip: context.ip,
    timestamp: new Date().toISOString(),
  });

  // Record error metrics
  monitoring.recordError(
    error instanceof Error ? error : new Error(errorMessage),
    `${context.method} ${context.path}`,
  );
}

// Create error response
function createErrorResponse(
  error: unknown,
  requestId: string,
  path: string,
): NextResponse<ErrorResponse> {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: 'Application Error',
        message: error.message,
        statusCode: error.statusCode,
        timestamp,
        path,
        requestId,
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'An unexpected error occurred',
        statusCode: 500,
        timestamp,
        path,
        requestId,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      error: 'Unknown Error',
      message: 'An unknown error occurred',
      statusCode: 500,
      timestamp,
      path,
      requestId,
    },
    { status: 500 },
  );
}

// Main error handling wrapper
export function withErrorHandling<T extends unknown[], R>(handler: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R> => {
    const requestId = generateRequestId();
    const request = args[0] as NextRequest;
    const path = request?.nextUrl?.pathname || 'unknown';
    const method = request?.method || 'unknown';
    const userAgent = request?.headers?.get('user-agent') || undefined;
    const ip =
      request?.headers?.get('x-forwarded-for') || request?.headers?.get('x-real-ip') || 'unknown';

    try {
      const result = await handler(...args);
      return result;
    } catch (error) {
      logError(error, {
        requestId,
        path,
        method,
        userAgent,
        ip,
      });

      // If it's already a NextResponse, return it
      if (error instanceof NextResponse) {
        return error as R;
      }

      // Create error response
      const errorResponse = createErrorResponse(error, requestId, path);
      return errorResponse as R;
    }
  };
}

// Specific error handlers for common scenarios
export function handleValidationError(error: unknown, requestId: string, path: string) {
  if (error instanceof Error && error.name === 'ZodError') {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: 'Invalid input data',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path,
        requestId,
        details: error.message,
      },
      { status: 400 },
    );
  }
  return null;
}

export function handleDatabaseError(error: unknown, requestId: string, path: string) {
  if (error instanceof Error && error.message.includes('Prisma')) {
    return NextResponse.json(
      {
        error: 'Database Error',
        message: 'A database operation failed',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
      { status: 500 },
    );
  }
  return null;
}

export function handleAuthError(error: unknown, requestId: string, path: string) {
  if (error instanceof Error && error.message.includes('auth')) {
    return NextResponse.json(
      {
        error: 'Authentication Error',
        message: 'Authentication failed',
        statusCode: 401,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
      { status: 401 },
    );
  }
  return null;
}

// Rate limiting error handler
export function handleRateLimitError(requestId: string, path: string, retryAfter: number) {
  return NextResponse.json(
    {
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
      path,
      requestId,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': (Date.now() + retryAfter * 1000).toString(),
      },
    },
  );
}

// Global error handler for unhandled errors
export function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    monitoring.recordError(error, 'uncaughtException');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    monitoring.recordError(
      reason instanceof Error ? reason : new Error(String(reason)),
      'unhandledRejection',
    );
    process.exit(1);
  });
}
