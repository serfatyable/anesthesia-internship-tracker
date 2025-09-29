// lib/middleware/monitoring.ts

import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';

export function withMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // const _startTime = performance.now();
    const url = new URL(req.url);
    const endpoint = url.pathname;
    const method = req.method;

    try {
      // Track the API call start
      monitoring.trackAPICall(endpoint, method, 0, 0);

      // Execute the handler
      const response = await handler(req);

      // Calculate response time
      const responseTime = performance.now() - performance.now();

      // Track successful API call
      monitoring.trackAPICall(endpoint, method, response.status, responseTime);

      // Track performance metrics
      monitoring.recordMetric('api.response_time', responseTime, {
        endpoint,
        method,
        status: response.status.toString(),
      });

      monitoring.recordMetric('api.requests', 1, {
        endpoint,
        method,
        status: response.status.toString(),
      });

      return response;
    } catch (error) {
      // Calculate response time
      const responseTime = performance.now() - performance.now();

      // Track error
      monitoring.trackError(
        error instanceof Error ? error : new Error('Unknown error'),
        {
          endpoint,
          method,
          responseTime,
        }
      );

      // Track error metrics
      monitoring.recordMetric('api.errors', 1, {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Re-throw the error
      throw error;
    }
  };
}

export function withDatabaseMonitoring<T extends any[], R>(
  operationName: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    // const _startTime = performance.now();

    try {
      const result = await monitoring.time(`db.${operationName}`, async () => {
        return fn(...args);
      });

      return result;
    } catch (error) {
      // Track database error
      monitoring.trackError(
        error instanceof Error ? error : new Error('Unknown database error'),
        {
          operation: operationName,
          type: 'database',
        }
      );

      throw error;
    }
  };
}

export function withCacheMonitoring<T extends any[], R>(
  operationName: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    // const _startTime = performance.now();

    try {
      const result = await monitoring.time(
        `cache.${operationName}`,
        async () => {
          return fn(...args);
        }
      );

      return result;
    } catch (error) {
      // Track cache error
      monitoring.trackError(
        error instanceof Error ? error : new Error('Unknown cache error'),
        {
          operation: operationName,
          type: 'cache',
        }
      );

      throw error;
    }
  };
}
