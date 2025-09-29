/**
 * Error reporting endpoint for production error tracking
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { monitoring } from '@/lib/utils/monitoring';
import { analytics } from '@/lib/monitoring/analytics';

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  level: 'page' | 'component';
  retryCount: number;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json();

    // Validate error report
    if (!errorReport.errorId || !errorReport.message) {
      return NextResponse.json({ error: 'Invalid error report format' }, { status: 400 });
    }

    // Log the error
    logger.error('Client-side error reported', {
      operation: 'error_reporting',
      errorId: errorReport.errorId,
      message: errorReport.message,
      level: errorReport.level,
      retryCount: errorReport.retryCount,
      userId: errorReport.userId || undefined,
      url: errorReport.url,
      userAgent: errorReport.userAgent,
      metadata: errorReport.metadata,
    });

    // Record error metrics
    monitoring.recordError(new Error(errorReport.message), `client_${errorReport.level}`);

    // Track error analytics
    analytics.trackEvent(
      'error_reported',
      {
        errorId: errorReport.errorId,
        level: errorReport.level,
        retryCount: errorReport.retryCount,
        hasStack: !!errorReport.stack,
        hasComponentStack: !!errorReport.componentStack,
        userId: errorReport.userId,
      },
      errorReport.userId,
    );

    // In a real application, you would:
    // 1. Store the error in a database
    // 2. Send to external error tracking service (Sentry, Bugsnag, etc.)
    // 3. Send alerts for critical errors
    // 4. Aggregate similar errors

    // For now, we'll just log and acknowledge
    return NextResponse.json(
      {
        message: 'Error report received',
        errorId: errorReport.errorId,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Error reporting endpoint failed', {
      operation: 'error_reporting',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error: 'Failed to process error report',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Get error statistics (admin only)
export async function GET() {
  try {
    // In a real application, you would check admin permissions here
    // For now, we'll return basic error statistics

    const errorStats = {
      totalErrors: monitoring.getAllMetrics()['error_rate']?.length || 0,
      errorRate: calculateErrorRate(),
      recentErrors: getRecentErrors(),
      errorTypes: getErrorTypes(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorStats);
  } catch (error) {
    logger.error('Error statistics endpoint failed', {
      operation: 'error_statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error: 'Failed to get error statistics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Helper functions
function calculateErrorRate(): number {
  const metrics = monitoring.getAllMetrics();
  const errorMetrics = metrics['error_rate'] || [];
  const totalMetrics = Object.values(metrics).reduce(
    (total, metricArray) => total + metricArray.length,
    0,
  );

  if (totalMetrics === 0) return 0;

  const totalErrors = errorMetrics.reduce((sum, metric) => sum + metric.value, 0);
  return Math.round((totalErrors / totalMetrics) * 100 * 100) / 100;
}

function getRecentErrors(): Array<{
  timestamp: number;
  message: string;
  level: string;
  count: number;
}> {
  // In a real application, you would query your error database
  // For now, return mock data
  return [
    {
      timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      message: 'TypeError: Cannot read property of undefined',
      level: 'component',
      count: 3,
    },
    {
      timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
      message: 'Network request failed',
      level: 'page',
      count: 1,
    },
  ];
}

function getErrorTypes(): Record<string, number> {
  // In a real application, you would aggregate error types from your database
  // For now, return mock data
  return {
    TypeError: 15,
    ReferenceError: 8,
    NetworkError: 5,
    ValidationError: 12,
    Unknown: 3,
  };
}
