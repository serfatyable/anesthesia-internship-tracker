/**
 * Advanced monitoring and analytics utilities
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface MetricData {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

interface AlertRule {
  name: string;
  condition: (value: number) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

class MonitoringSystem {
  private metrics = new Map<string, MetricData[]>();
  private alerts: AlertRule[] = [];
  private maxMetricsPerKey = 1000;

  // Register a metric
  recordMetric(key: string, value: number, tags?: Record<string, string>): void {
    const metric: MetricData = {
      timestamp: Date.now(),
      value,
      tags: tags || {},
    };

    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metricArray = this.metrics.get(key)!;
    metricArray.push(metric);

    // Keep only recent metrics
    if (metricArray.length > this.maxMetricsPerKey) {
      metricArray.splice(0, metricArray.length - this.maxMetricsPerKey);
    }

    // Check alerts
    this.checkAlerts(key, value);
  }

  // Get metrics for a specific key
  getMetrics(key: string, timeRange?: { start: number; end: number }): MetricData[] {
    const metrics = this.metrics.get(key) || [];

    if (timeRange) {
      return metrics.filter((m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
    }

    return [...metrics];
  }

  // Get aggregated statistics
  getStats(
    key: string,
    timeRange?: { start: number; end: number },
  ): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  } {
    const metrics = this.getMetrics(key, timeRange);
    if (metrics.length === 0) {
      return { count: 0, min: 0, max: 0, avg: 0, p95: 0, p99: 0 };
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const count = values.length;
    const min = values[0];
    const max = values[count - 1];
    const avg = values.reduce((sum, val) => sum + val, 0) / count;
    const p95Index = Math.max(0, Math.floor(count * 0.95));
    const p99Index = Math.max(0, Math.floor(count * 0.99));

    return {
      count,
      min: min || 0,
      max: max || 0,
      avg: Math.round(avg * 100) / 100,
      p95: values[p95Index] || 0,
      p99: values[p99Index] || 0,
    };
  }

  // Add alert rule
  addAlert(rule: AlertRule): void {
    this.alerts.push(rule);
  }

  // Check alerts for a metric
  private checkAlerts(key: string, value: number): void {
    this.alerts.forEach((alert) => {
      if (alert.condition(value)) {
        this.triggerAlert(alert, key, value);
      }
    });
  }

  // Trigger an alert
  private triggerAlert(alert: AlertRule, key: string, value: number): void {
    const message = `${alert.message} (${key}: ${value})`;

    console.warn(`[${alert.severity.toUpperCase()}] ${message}`);

    // In a real application, you would send this to a monitoring service
    // like DataDog, New Relic, or your own alerting system
  }

  // Get all metrics
  getAllMetrics(): Record<string, MetricData[]> {
    const result: Record<string, MetricData[]> = {};
    this.metrics.forEach((metrics, key) => {
      result[key] = [...metrics];
    });
    return result;
  }

  // Clear old metrics
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;

    this.metrics.forEach((metrics, key) => {
      const filtered = metrics.filter((m) => m.timestamp > cutoff);
      if (filtered.length === 0) {
        this.metrics.delete(key);
      } else {
        this.metrics.set(key, filtered);
      }
    });
  }

  // Record error method
  recordError(error: Error, context?: string): void {
    this.recordMetric('error_rate', 1, {
      error_type: error.constructor.name,
      context: context || 'unknown',
    });
  }
}

// Global monitoring instance
export const monitoring = new MonitoringSystem();

// Predefined alert rules
monitoring.addAlert({
  name: 'high_response_time',
  condition: (value) => value > 2000, // 2 seconds
  severity: 'high',
  message: 'High response time detected',
});

monitoring.addAlert({
  name: 'high_memory_usage',
  condition: (value) => value > 100 * 1024 * 1024, // 100MB
  severity: 'medium',
  message: 'High memory usage detected',
});

monitoring.addAlert({
  name: 'high_error_rate',
  condition: (value) => value > 0.1, // 10%
  severity: 'critical',
  message: 'High error rate detected',
});

// Performance monitoring decorators
export function monitorPerformance<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string,
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();

    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result
          .then((resolved) => {
            const duration = performance.now() - start;
            monitoring.recordMetric(`performance.${operationName}`, duration);
            return resolved;
          })
          .catch((error) => {
            const duration = performance.now() - start;
            monitoring.recordMetric(`performance.${operationName}.error`, duration);
            monitoring.recordMetric('error_rate', 1);
            throw error;
          });
      }

      const duration = performance.now() - start;
      monitoring.recordMetric(`performance.${operationName}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      monitoring.recordMetric(`performance.${operationName}.error`, duration);
      monitoring.recordMetric('error_rate', 1);
      throw error;
    }
  }) as T;
}

// Database query monitoring
export function monitorDatabaseQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
  return monitorPerformance(queryFn, `db.${queryName}`)();
}

// API route monitoring
export function monitorApiRoute<T extends (...args: any[]) => any>(
  routeName: string,
  handler: T,
): T {
  return monitorPerformance(handler, `api.${routeName}`);
}

// Memory usage monitoring
export function recordMemoryUsage(): void {
  // Only run in Node.js environment, not in Edge Runtime
  if (
    typeof process !== 'undefined' &&
    process.memoryUsage &&
    typeof window === 'undefined' &&
    process.env.NEXT_RUNTIME !== 'edge'
  ) {
    try {
      const usage = process.memoryUsage();
      monitoring.recordMetric('memory.heap_used', usage.heapUsed);
      monitoring.recordMetric('memory.heap_total', usage.heapTotal);
      monitoring.recordMetric('memory.external', usage.external);
      monitoring.recordMetric('memory.rss', usage.rss);
    } catch (error) {
      // Silently fail in Edge Runtime
      console.debug('Memory monitoring not available in Edge Runtime');
    }
  }
}

// Error rate monitoring
export function recordError(error: Error, context?: string): void {
  monitoring.recordMetric('error_rate', 1, {
    error_type: error.constructor.name,
    context: context || 'unknown',
  });
}

// Custom metrics
export function recordCustomMetric(
  key: string,
  value: number,
  tags?: Record<string, string>,
): void {
  monitoring.recordMetric(key, value, tags);
}

// Get monitoring dashboard data
export function getMonitoringDashboard(): {
  performance: Record<string, any>;
  memory: Record<string, any>;
  errors: Record<string, any>;
  custom: Record<string, any>;
} {
  const now = Date.now();
  const lastHour = now - 60 * 60 * 1000;

  return {
    performance: {
      'api.response_time': monitoring.getStats('performance.api', { start: lastHour, end: now }),
      'db.query_time': monitoring.getStats('performance.db', { start: lastHour, end: now }),
    },
    memory: {
      heap_used: monitoring.getStats('memory.heap_used', { start: lastHour, end: now }),
      heap_total: monitoring.getStats('memory.heap_total', { start: lastHour, end: now }),
    },
    errors: {
      error_rate: monitoring.getStats('error_rate', { start: lastHour, end: now }),
    },
    custom: {
      // Add any custom metrics here
    },
  };
}

// Cleanup old metrics periodically
setInterval(
  () => {
    monitoring.cleanup();
  },
  60 * 60 * 1000,
); // Clean up every hour

// Record memory usage periodically
setInterval(() => {
  recordMemoryUsage();
}, 30 * 1000); // Every 30 seconds
