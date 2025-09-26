/**
 * Performance monitoring and metrics service
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

interface PerformanceConfig {
  enableMetrics: boolean;
  sampleRate: number;
  maxMetrics: number;
  flushInterval: number;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private config: PerformanceConfig = {
    enableMetrics: process.env.NODE_ENV === 'production',
    sampleRate: 1.0,
    maxMetrics: 1000,
    flushInterval: 60000, // 1 minute
  };

  constructor() {
    if (this.config.enableMetrics) {
      setInterval(() => this.flushMetrics(), this.config.flushInterval);
    }
  }

  /**
   * Record a timing metric
   */
  recordTiming(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.config.enableMetrics || Math.random() > this.config.sampleRate) {
      return;
    }

    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'timing',
      tags: tags || {},
    });
  }

  /**
   * Record a counter metric
   */
  recordCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    if (!this.config.enableMetrics || Math.random() > this.config.sampleRate) {
      return;
    }

    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'counter',
      tags: tags || {},
    });
  }

  /**
   * Record a gauge metric
   */
  recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.config.enableMetrics || Math.random() > this.config.sampleRate) {
      return;
    }

    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'gauge',
      tags: tags || {},
    });
  }

  /**
   * Time a function execution
   */
  async timeFunction<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordTiming(name, duration, tags);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordTiming(`${name}.error`, duration, { ...tags, error: 'true' });
      throw error;
    }
  }

  /**
   * Time a synchronous function execution
   */
  timeSyncFunction<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordTiming(name, duration, tags);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordTiming(`${name}.error`, duration, { ...tags, error: 'true' });
      throw error;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((metric) => metric.name === name);
  }

  /**
   * Get average timing for a metric
   */
  getAverageTiming(name: string): number {
    const timings = this.getMetricsByName(name).filter((m) => m.type === 'timing');
    if (timings.length === 0) return 0;

    const sum = timings.reduce((acc, metric) => acc + metric.value, 0);
    return sum / timings.length;
  }

  /**
   * Get total count for a metric
   */
  getTotalCount(name: string): number {
    const counters = this.getMetricsByName(name).filter((m) => m.type === 'counter');
    return counters.reduce((acc, metric) => acc + metric.value, 0);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Add a metric to the collection
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  /**
   * Flush metrics (in a real implementation, this would send to a monitoring service)
   */
  private flushMetrics(): void {
    if (this.metrics.length === 0) return;

    // In a real implementation, you would send these to a monitoring service
    // like DataDog, New Relic, or CloudWatch
    console.log(`Flushing ${this.metrics.length} performance metrics`);

    // Group metrics by name and type for summary
    const summary = this.metrics.reduce(
      (acc, metric) => {
        const key = `${metric.name}:${metric.type}`;
        if (!acc[key]) {
          acc[key] = { count: 0, total: 0, min: Infinity, max: -Infinity };
        }

        acc[key].count++;
        acc[key].total += metric.value;
        acc[key].min = Math.min(acc[key].min, metric.value);
        acc[key].max = Math.max(acc[key].max, metric.value);

        return acc;
      },
      {} as Record<string, { count: number; total: number; min: number; max: number }>,
    );

    console.log('Performance Summary:', summary);

    // Clear metrics after flushing
    this.clearMetrics();
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, unknown> {
    const summary: Record<string, unknown> = {};

    // Group metrics by name
    const grouped = this.metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = [];
        }
        acc[metric.name]!.push(metric);
        return acc;
      },
      {} as Record<string, PerformanceMetric[]>,
    );

    // Calculate statistics for each metric
    Object.entries(grouped).forEach(([name, metrics]) => {
      const values = metrics.map((m) => m.value);
      summary[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        lastValue: values[values.length - 1],
      };
    });

    return summary;
  }
}

export const performanceService = new PerformanceService();

/**
 * Performance decorator for API routes
 */
export function withPerformanceMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  metricName: string,
): T {
  return (async (...args: Parameters<T>) => {
    return await performanceService.timeFunction(metricName, () => fn(...args));
  }) as T;
}

/**
 * Performance decorator for synchronous functions
 */
export function withSyncPerformanceMonitoring<T extends (...args: unknown[]) => unknown>(
  fn: T,
  metricName: string,
): T {
  return ((...args: Parameters<T>) => {
    return performanceService.timeSyncFunction(metricName, () => fn(...args));
  }) as T;
}
