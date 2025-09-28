// Performance monitoring utilities
interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isDevelopment = process.env.NODE_ENV === 'development';

  start(name: string, metadata?: Record<string, unknown>): void {
    if (!this.isDevelopment) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata: metadata || {},
    });
  }

  end(name: string): number | null {
    if (!this.isDevelopment) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log slow operations
    if (duration > 1000) {
      console.warn(
        `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`,
        metric.metadata,
      );
    } else if (duration > 500) {
      console.info(`Operation: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
    }

    return duration;
  }

  measure<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
    if (!this.isDevelopment) return fn();

    this.start(name, metadata);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    if (!this.isDevelopment) return fn();

    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clear(): void {
    this.metrics.clear();
  }

  getReport(): string {
    const metrics = this.getMetrics();
    const report = metrics
      .filter((m) => m.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .map((m) => `${m.name}: ${m.duration?.toFixed(2)}ms`)
      .join('\n');

    return report || 'No performance metrics recorded';
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render times (import React in your component)
export function createPerformanceHook() {
  return function usePerformanceMeasure(name: string, deps: unknown[] = []) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useEffect } = require('react');
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        performanceMonitor.start(`component-${name}`);
        return () => {
          performanceMonitor.end(`component-${name}`);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, deps);
    }
  };
}

// Database query performance wrapper
export function withPerformanceMonitoring<T extends (...args: unknown[]) => unknown>(
  fn: T,
  operationName: string,
): T {
  return ((...args: Parameters<T>) => {
    return performanceMonitor.measureAsync(
      `db-${operationName}`,
      () => fn(...args) as Promise<ReturnType<T>>,
    );
  }) as T;
}

// API route performance wrapper
export function withAPIPerformanceMonitoring<T extends (...args: unknown[]) => unknown>(
  fn: T,
  routeName: string,
): T {
  return ((...args: Parameters<T>) => {
    return performanceMonitor.measureAsync(
      `api-${routeName}`,
      () => fn(...args) as Promise<ReturnType<T>>,
    );
  }) as T;
}
