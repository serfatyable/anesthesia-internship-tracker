/**
 * Centralized error handling utilities
 */

export interface ApiError {
  error?: string;
  message: string;
  statusCode: number;
  details?: unknown;
  timestamp: string;
  path?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createApiError(
  message: string,
  statusCode: number = 500,
  details?: unknown
): ApiError {
  return {
    message,
    error: message,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
  };
}

export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}Error:`, {
    message: errorMessage,
    stack: errorStack,
    error,
  });
}

export function handleAsyncError<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, fn.name);
      throw error;
    }
  };
}

export function createErrorResponse(error: unknown, path?: string) {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      details: error.details,
      timestamp,
      path,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
      timestamp,
      path,
    };
  }

  return {
    error: 'Internal server error',
    statusCode: 500,
    timestamp,
    path,
  };
}
