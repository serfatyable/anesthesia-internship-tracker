'use client';

import React from 'react';
import { monitoring } from '@/lib/utils/monitoring';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | undefined;
  errorId?: string | undefined;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error | undefined;
    resetError: () => void;
    errorId?: string | undefined;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component';
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component' } = this.props;

    // Generate error ID for tracking
    const errorId =
      this.state.errorId ||
      `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Enhanced error logging
    console.error(`[${level.toUpperCase()}] ErrorBoundary caught an error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId,
      retryCount: this.retryCount,
      timestamp: new Date().toISOString(),
    });

    // Record error metrics
    try {
      monitoring.recordMetric('error_rate', 1, {
        error_type: error.constructor.name,
        context: `ErrorBoundary:${level}`,
        errorId,
      });
      monitoring.recordMetric('error_boundary.triggered', 1, {
        level,
        errorId,
      });
    } catch (monitoringError) {
      console.error('Failed to record error metrics:', monitoringError);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo, errorId);
    }
  }

  private reportError = async (
    error: Error,
    errorInfo: React.ErrorInfo,
    errorId: string
  ) => {
    try {
      // In a real application, you would send this to your error reporting service
      // like Sentry, LogRocket, or Bugsnag
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          level: this.props.level || 'component',
          retryCount: this.retryCount,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  resetError = () => {
    this.retryCount++;

    if (this.retryCount <= this.maxRetries) {
      console.log(
        `Retrying after error (attempt ${this.retryCount}/${this.maxRetries})`
      );
      this.setState({ hasError: false, error: undefined, errorId: undefined });
    } else {
      console.error('Max retries exceeded, keeping error state');
    }
  };

  override render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
  errorId,
}: {
  error?: Error | undefined;
  resetError: () => void;
  errorId?: string | undefined;
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center'>
        <div className='mb-4'>
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
            <svg
              className='h-6 w-6 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-red-600 mb-2'>
            Something went wrong
          </h1>
          <p className='text-gray-600 mb-4'>
            We encountered an unexpected error. Please try again.
          </p>

          {errorId && (
            <p className='text-xs text-gray-500 mb-4'>Error ID: {errorId}</p>
          )}
        </div>

        {isDevelopment && error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded text-left'>
            <p className='text-sm font-semibold text-red-800 mb-2'>
              Error Details:
            </p>
            <p className='text-sm text-red-800 font-mono break-words'>
              {error.message}
            </p>
            {error.stack && (
              <details className='mt-2'>
                <summary className='text-xs text-red-600 cursor-pointer'>
                  Stack Trace
                </summary>
                <pre className='text-xs text-red-800 font-mono mt-2 whitespace-pre-wrap break-words'>
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className='flex gap-2 justify-center'>
          <button
            onClick={resetError}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
          >
            Reload Page
          </button>
        </div>

        <div className='mt-4 text-xs text-gray-500'>
          If this problem persists, please contact support with the error ID
          above.
        </div>
      </div>
    </div>
  );
}
