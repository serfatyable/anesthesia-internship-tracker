/**
 * Performance monitoring utilities
 */

interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep only last 1000 metrics

  startTimer(operation: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric({
        operation,
        duration,
        timestamp: Date.now(),
      });
    };
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && metric.duration > 1000) {
      console.warn(
        `Slow operation detected: ${metric.operation} took ${metric.duration.toFixed(2)}ms`
      );
    }
  }

  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  getAverageDuration(operation: string): number {
    const operationMetrics = this.getMetrics(operation);
    if (operationMetrics.length === 0) return 0;

    const totalDuration = operationMetrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    );
    return totalDuration / operationMetrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Higher-order function to wrap async functions with performance monitoring
export function withPerformanceMonitoring<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    const endTimer = performanceMonitor.startTimer(operationName);
    try {
      const result = await fn(...args);
      return result;
    } finally {
      endTimer();
    }
  };
}

// React hook for performance monitoring
export function usePerformanceMonitor(operationName: string) {
  const startTimer = () => performanceMonitor.startTimer(operationName);
  return { startTimer };
}

// Database query performance monitoring
export function monitorDatabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return withPerformanceMonitoring(queryFn, `db:${queryName}`)();
}

// API route performance monitoring
export function monitorApiRoute<T extends unknown[], R>(
  routeName: string,
  handler: (...args: T) => Promise<R>
) {
  return withPerformanceMonitoring(handler, `api:${routeName}`);
}
