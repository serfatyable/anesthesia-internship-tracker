// lib/monitoring/performance.ts

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  maxMetrics: number;
  flushInterval: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private config: PerformanceConfig;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      sampleRate: 1.0,
      maxMetrics: 1000,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Record a performance metric
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags: tags || {},
    };

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  /**
   * Record timing for a function execution
   */
  async time<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.record(`${name}.duration`, duration, tags);
      this.record(`${name}.success`, 1, tags);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(`${name}.duration`, duration, tags);
      this.record(`${name}.error`, 1, {
        ...tags,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  /**
   * Record timing for a synchronous function execution
   */
  timeSync<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.record(`${name}.duration`, duration, tags);
      this.record(`${name}.success`, 1, tags);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(`${name}.duration`, duration, tags);
      this.record(`${name}.error`, 1, {
        ...tags,
        error: error instanceof Error ? error.message : 'Unknown',
      });
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
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(): Record<
    string,
    { count: number; avg: number; min: number; max: number; sum: number }
  > {
    const aggregated: Record<
      string,
      { count: number; avg: number; min: number; max: number; sum: number }
    > = {};

    for (const metric of this.metrics) {
      if (!aggregated[metric.name]) {
        aggregated[metric.name] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
          sum: 0,
        };
      }

      const stats = aggregated[metric.name];
      if (stats) {
        stats.count++;
        stats.sum += metric.value;
        stats.min = Math.min(stats.min, metric.value);
        stats.max = Math.max(stats.max, metric.value);
        stats.avg = stats.sum / stats.count;
      }
    }

    return aggregated;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush metrics to external service (placeholder)
   */
  private async flush(): Promise<void> {
    if (this.metrics.length === 0) {
      return;
    }

    try {
      // In a real implementation, you would send metrics to your monitoring service
      // For now, we'll just log them
      console.log(
        `[PerformanceMonitor] Flushing ${this.metrics.length} metrics`
      );

      // Clear metrics after flushing
      this.metrics = [];
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to flush metrics:', error);
    }
  }

  /**
   * Stop the monitor
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetric, PerformanceConfig };
