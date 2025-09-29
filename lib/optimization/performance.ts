/**
 * Advanced performance optimization utilities
 */
import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { monitoring } from '@/lib/utils/monitoring';
// import { analytics } from '@/lib/monitoring/analytics';

// Performance monitoring decorator
export function measurePerformance<T extends (...args: unknown[]) => unknown>(
  fn: T,
  operationName: string,
  options: {
    logSlowOperations?: boolean;
    slowThreshold?: number;
    recordMetrics?: boolean;
  } = {}
): T {
  const {
    logSlowOperations = true,
    slowThreshold = 1000, // 1 second
    recordMetrics = true,
  } = options;

  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const startMemory = process.memoryUsage();

    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result
          .then(resolved => {
            const duration = performance.now() - start;
            const endMemory = process.memoryUsage();
            const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

            if (recordMetrics) {
              monitoring.recordMetric(`performance.${operationName}`, duration);
              monitoring.recordMetric(`memory.${operationName}`, memoryDelta);
            }

            if (logSlowOperations && duration > slowThreshold) {
              logger.warn('Slow operation detected', {
                operation: 'performance_monitoring',
                operationName,
                duration: Math.round(duration),
                memoryDelta: Math.round(memoryDelta / 1024),
              });
            }

            return resolved;
          })
          .catch(error => {
            const duration = performance.now() - start;
            const endMemory = process.memoryUsage();
            const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

            if (recordMetrics) {
              monitoring.recordMetric(
                `performance.${operationName}_error`,
                duration
              );
              monitoring.recordMetric(
                `memory.${operationName}_error`,
                memoryDelta
              );
            }

            logger.error(
              'Operation failed',
              {
                operation: 'performance_monitoring',
                operationName,
                duration: Math.round(duration),
                memoryDelta: Math.round(memoryDelta / 1024),
              },
              error as Error
            );

            throw error;
          });
      }

      const duration = performance.now() - start;
      const endMemory = process.memoryUsage();
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      if (recordMetrics) {
        monitoring.recordMetric(`performance.${operationName}`, duration);
        monitoring.recordMetric(`memory.${operationName}`, memoryDelta);
      }

      if (logSlowOperations && duration > slowThreshold) {
        logger.warn('Slow operation detected', {
          operation: 'performance_monitoring',
          operationName,
          duration: Math.round(duration),
          memoryDelta: Math.round(memoryDelta / 1024),
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      const endMemory = process.memoryUsage();
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      if (recordMetrics) {
        monitoring.recordMetric(`performance.${operationName}_error`, duration);
        monitoring.recordMetric(`memory.${operationName}_error`, memoryDelta);
      }

      logger.error(
        'Operation failed',
        {
          operation: 'performance_monitoring',
          operationName,
          duration: Math.round(duration),
          memoryDelta: Math.round(memoryDelta / 1024),
        },
        error as Error
      );

      throw error;
    }
  }) as T;
}

// Database query optimization
export function optimizeQuery<T extends (...args: unknown[]) => unknown>(
  queryFn: T,
  options: {
    cacheKey?: string;
    ttl?: number;
    maxResults?: number;
    selectFields?: string[];
  } = {}
): T {
  const { cacheKey, maxResults = 1000 /*, selectFields*/ } = options;

  return measurePerformance(
    (async (...args: unknown[]) => {
      // Add query optimization logic here
      const start = performance.now();

      try {
        const result = await (queryFn as (...args: unknown[]) => unknown)(
          ...args
        );

        const duration = performance.now() - start;

        // Log slow queries
        if (duration > 500) {
          logger.warn('Slow database query detected', {
            operation: 'database_query',
            duration: Math.round(duration),
            cacheKey: cacheKey ?? '',
            maxResults,
            // omit selectFields from log context to satisfy typing
          });
        }

        return result;
      } catch (error) {
        logger.error(
          'Database query failed',
          {
            operation: 'database_query',
            cacheKey: cacheKey ?? '',
          },
          error as Error
        );
        throw error;
      }
    }) as (...args: unknown[]) => Promise<unknown>,
    `database_query_${cacheKey || 'unknown'}`,
    { slowThreshold: 500 }
  ) as T;
}

// Memory optimization utilities
export function optimizeMemory<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: {
    maxMemoryUsage?: number; // MB
    cleanupInterval?: number; // ms
  } = {}
): T {
  const { maxMemoryUsage = 100 /*, cleanupInterval = 60000 */ } = options;

  return ((...args: Parameters<T>) => {
    const startMemory = process.memoryUsage();

    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result.then(resolved => {
          const endMemory = process.memoryUsage();
          const memoryUsage =
            (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024; // MB

          if (memoryUsage > maxMemoryUsage) {
            logger.warn('High memory usage detected', {
              operation: 'memory_optimization',
              memoryUsage: Math.round(memoryUsage),
              maxMemoryUsage,
            });
          }

          return resolved;
        });
      }

      const endMemory = process.memoryUsage();
      const memoryUsage =
        (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024; // MB

      if (memoryUsage > maxMemoryUsage) {
        logger.warn('High memory usage detected', {
          operation: 'memory_optimization',
          memoryUsage: Math.round(memoryUsage),
          maxMemoryUsage,
        });
      }

      return result;
    } catch (error) {
      logger.error(
        'Memory optimization error',
        {
          operation: 'memory_optimization',
        },
        error as Error
      );
      throw error;
    }
  }) as T;
}

// Response compression
export function compressResponse(response: NextResponse): NextResponse {
  // Add compression headers
  response.headers.set('Content-Encoding', 'gzip');
  response.headers.set('Vary', 'Accept-Encoding');

  return response;
}

// Request deduplication
const requestCache = new Map<
  string,
  { response: NextResponse; timestamp: number }
>();
const CACHE_TTL = 5000; // 5 seconds

export function deduplicateRequests<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const now = Date.now();

    // Check if we have a cached response
    const cached = requestCache.get(key);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      logger.debug('Request deduplicated', {
        operation: 'request_deduplication',
        key,
        age: now - cached.timestamp,
      });
      return cached.response;
    }

    // Execute the function
    const result = fn(...args);

    if (result instanceof Promise) {
      return result.then(response => {
        if (response instanceof NextResponse) {
          requestCache.set(key, { response, timestamp: now });
        }
        return response;
      });
    }

    if (result instanceof NextResponse) {
      requestCache.set(key, { response: result, timestamp: now });
    }

    return result;
  }) as T;
}

// Cleanup old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}, CACHE_TTL);

// Performance monitoring middleware
export function performanceMiddleware(): NextResponse | null {
  const start = performance.now();
  const startMemory = process.memoryUsage();

  // Add performance headers
  const response = NextResponse.next();

  response.headers.set('X-Response-Time', '0');
  response.headers.set('X-Memory-Usage', '0');

  // Override the response to add timing
  const originalResponse = response;
  const newResponse = new NextResponse(originalResponse.body, {
    status: originalResponse.status,
    statusText: originalResponse.statusText,
    headers: originalResponse.headers,
  });

  // Add timing information
  const duration = performance.now() - start;
  const endMemory = process.memoryUsage();
  const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

  newResponse.headers.set('X-Response-Time', `${Math.round(duration)}ms`);
  newResponse.headers.set(
    'X-Memory-Usage',
    `${Math.round(memoryDelta / 1024)}KB`
  );

  // Record metrics
  monitoring.recordMetric('middleware.performance', duration);
  monitoring.recordMetric('middleware.memory', memoryDelta);

  return newResponse;
}

// Performance analysis utilities
export function analyzePerformance(metrics: Record<string, number[]>): {
  average: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
} {
  const values = Object.values(metrics as Record<string, number[]>)
    .flat()
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return { average: 0, median: 0, p95: 0, p99: 0, min: 0, max: 0 };
  }

  const average =
    values.reduce((sum, val) => sum + val, 0) / (values.length || 1);
  const median = values[Math.floor(values.length / 2)] ?? 0;
  const p95Index = Math.floor(values.length * 0.95);
  const p99Index = Math.floor(values.length * 0.99);

  return {
    average: Math.round(average * 100) / 100,
    median: Math.round(median * 100) / 100,
    p95: Math.round((values[p95Index] ?? 0) * 100) / 100,
    p99: Math.round((values[p99Index] ?? 0) * 100) / 100,
    min: Math.round((values[0] ?? 0) * 100) / 100,
    max: Math.round((values[values.length - 1] ?? 0) * 100) / 100,
  };
}

// Memory leak detection
type MemorySnapshot = ReturnType<typeof process.memoryUsage> & {
  timestamp: number;
};

export function detectMemoryLeaks(): {
  isLeaking: boolean;
  heapGrowth: number;
  externalGrowth: number;
  rssGrowth: number;
} {
  const memory = process.memoryUsage();
  const now = Date.now();

  // Store previous memory usage
  const state = detectMemoryLeaks as unknown as {
    previous?: MemorySnapshot;
  };

  if (!state.previous) {
    state.previous = { ...memory, timestamp: now } as MemorySnapshot;
    return { isLeaking: false, heapGrowth: 0, externalGrowth: 0, rssGrowth: 0 };
  }

  const timeDelta = now - state.previous.timestamp;
  const heapGrowth = (memory.heapUsed - state.previous.heapUsed) / timeDelta;
  const externalGrowth =
    (memory.external - state.previous.external) / timeDelta;
  const rssGrowth = (memory.rss - state.previous.rss) / timeDelta;

  const isLeaking = heapGrowth > 1024 * 1024; // 1MB per second

  if (isLeaking) {
    logger.warn('Potential memory leak detected', {
      operation: 'memory_leak_detection',
      heapGrowth: Math.round(heapGrowth / 1024), // KB/s
      externalGrowth: Math.round(externalGrowth / 1024), // KB/s
      rssGrowth: Math.round(rssGrowth / 1024), // KB/s
    });
  }

  state.previous = { ...memory, timestamp: now } as MemorySnapshot;

  return {
    isLeaking,
    heapGrowth: Math.round(heapGrowth / 1024), // KB/s
    externalGrowth: Math.round(externalGrowth / 1024), // KB/s
    rssGrowth: Math.round(rssGrowth / 1024), // KB/s
  };
}

// Initialize memory leak detection
setInterval(detectMemoryLeaks, 30000); // Check every 30 seconds
