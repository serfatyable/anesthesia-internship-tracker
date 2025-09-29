/**
 * Advanced error boundary utilities and error recovery strategies
 */

import React, { ErrorInfo, ReactNode, useState, useCallback } from 'react';
import { recordError } from './monitoring';

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | undefined;
  errorInfo?: ErrorInfo | undefined;
  errorId?: string;
  retryCount: number;
  lastErrorTime?: number;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
  isolate?: boolean; // Whether to isolate errors to this boundary
}

export interface ErrorRecoveryStrategy {
  name: string;
  canRecover: (error: Error) => boolean;
  recover: (error: Error) => Promise<void> | void;
}

// Error recovery strategies
export const errorRecoveryStrategies: ErrorRecoveryStrategy[] = [
  {
    name: 'network_retry',
    canRecover: error =>
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout'),
    recover: async () => {
      console.log('Attempting network retry...');
      // Implement retry logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    name: 'cache_clear',
    canRecover: error =>
      error.message.includes('cache') || error.message.includes('stale'),
    recover: () => {
      console.log('Clearing caches...');
      // Clear relevant caches
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    },
  },
  {
    name: 'auth_refresh',
    canRecover: error =>
      error.message.includes('unauthorized') || error.message.includes('token'),
    recover: async () => {
      console.log('Refreshing authentication...');
      // Implement auth refresh logic
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
  },
];

// Error classification
export function classifyError(error: Error): {
  type: 'network' | 'validation' | 'auth' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
} {
  const message = error.message.toLowerCase();
  // const stack = error.stack?.toLowerCase() || ''; // Unused variable removed

  let type:
    | 'network'
    | 'validation'
    | 'auth'
    | 'server'
    | 'client'
    | 'unknown' = 'unknown';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let recoverable = false;

  // Classify by type
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout')
  ) {
    type = 'network';
    severity = 'medium';
    recoverable = true;
  } else if (message.includes('validation') || message.includes('invalid')) {
    type = 'validation';
    severity = 'low';
    recoverable = false;
  } else if (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('token')
  ) {
    type = 'auth';
    severity = 'high';
    recoverable = true;
  } else if (
    message.includes('server') ||
    message.includes('500') ||
    message.includes('internal')
  ) {
    type = 'server';
    severity = 'high';
    recoverable = true;
  } else if (message.includes('client') || message.includes('browser')) {
    type = 'client';
    severity = 'medium';
    recoverable = true;
  }

  // Adjust severity based on error characteristics
  if (message.includes('critical') || message.includes('fatal')) {
    severity = 'critical';
  } else if (message.includes('warning') || message.includes('minor')) {
    severity = 'low';
  }

  return { type, severity, recoverable };
}

// Error reporting
export function reportError(
  error: Error,
  errorInfo?: ErrorInfo,
  context?: string
): void {
  const classification = classifyError(error);
  const errorId = generateErrorId();

  // Record in monitoring system
  recordError(error, context);

  // Log error details
  console.error('Error reported:', {
    id: errorId,
    message: error.message,
    stack: error.stack,
    classification,
    context,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  });

  // In a real application, you would send this to an error reporting service
  // like Sentry, LogRocket, or your own error tracking system
  if (typeof window !== 'undefined') {
    // Send to error reporting service
    sendToErrorService({
      id: errorId,
      error,
      errorInfo,
      context,
      classification,
    });
  }
}

// Generate unique error ID
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Send error to external service
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendToErrorService(errorData: any): Promise<void> {
  try {
    // In a real application, you would send this to your error reporting service
    console.log('Sending error to service:', errorData);

    // Example: Send to API endpoint
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // });
  } catch (err) {
    console.error('Failed to send error to service:', err);
  }
}

// Error recovery
export async function attemptErrorRecovery(error: Error): Promise<boolean> {
  const classification = classifyError(error);

  if (!classification.recoverable) {
    return false;
  }

  for (const strategy of errorRecoveryStrategies) {
    if (strategy.canRecover(error)) {
      try {
        await strategy.recover(error);
        console.log(
          `Error recovery successful using strategy: ${strategy.name}`
        );
        return true;
      } catch (recoveryError) {
        console.error(
          `Error recovery failed for strategy ${strategy.name}:`,
          recoveryError
        );
      }
    }
  }

  return false;
}

// Error boundary hook
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
    reportError(error);
  }, []);

  return { error, resetError, captureError };
}

// Global error handler
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
    reportError(error, undefined, 'unhandled_promise_rejection');
  });

  // Uncaught errors
  window.addEventListener('error', event => {
    const error =
      event.error instanceof Error ? event.error : new Error(event.message);
    reportError(error, undefined, 'uncaught_error');
  });
}

// Error boundary component
export class AdvancedErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
      lastErrorTime: Date.now(),
    };
  }

  override componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    this.setState({ errorInfo: _errorInfo });

    // Report error
    reportError(error, _errorInfo, 'error_boundary');

    // Call custom error handler
    this.props.onError?.(error, _errorInfo);

    // Attempt recovery
    this.attemptRecovery(error);
  }

  private async attemptRecovery(error: Error) {
    const recovered = await attemptErrorRecovery(error);

    if (recovered && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.retryTimeout = setTimeout(() => {
        this.setState({
          hasError: false,
          error: undefined as Error | undefined,
          errorInfo: undefined as ErrorInfo | undefined,
          retryCount: this.state.retryCount + 1,
        });
      }, this.props.retryDelay || 1000);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined as Error | undefined,
      errorInfo: undefined as ErrorInfo | undefined,
      retryCount: 0,
    });
  };

  override componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return React.createElement(
        'div',
        {
          className: 'min-h-screen flex items-center justify-center bg-gray-50',
        },
        React.createElement(
          'div',
          {
            className:
              'max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center',
          },
          React.createElement(
            'div',
            {
              className: 'mb-4',
            },
            React.createElement(
              'h1',
              {
                className: 'text-2xl font-bold text-red-600 mb-2',
              },
              'Something went wrong'
            ),
            React.createElement(
              'p',
              {
                className: 'text-gray-600',
              },
              'We encountered an unexpected error. Please try again.'
            )
          ),
          process.env.NODE_ENV === 'development' &&
            this.state.error &&
            React.createElement(
              'div',
              {
                className:
                  'mb-4 p-3 bg-red-50 border border-red-200 rounded text-left',
              },
              React.createElement(
                'p',
                {
                  className: 'text-sm text-red-800 font-mono',
                },
                this.state.error.message
              ),
              this.state.errorId &&
                React.createElement(
                  'p',
                  {
                    className: 'text-xs text-gray-500 mt-1',
                  },
                  `Error ID: ${this.state.errorId}`
                )
            ),
          React.createElement(
            'div',
            {
              className: 'flex space-x-3 justify-center',
            },
            React.createElement(
              'button',
              {
                onClick: this.handleRetry,
                className:
                  'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors',
              },
              'Try Again'
            ),
            React.createElement(
              'button',
              {
                onClick: () => window.location.reload(),
                className:
                  'bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors',
              },
              'Reload Page'
            )
          )
        )
      );
    }

    return this.props.children;
  }
}

// Initialize global error handlers
if (typeof window !== 'undefined') {
  setupGlobalErrorHandlers();
}
