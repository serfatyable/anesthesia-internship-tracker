'use client';

import { useEffect } from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
  message?: string;
}

export default function ErrorFallback({ 
  error, 
  resetError, 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.'
}: ErrorFallbackProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
