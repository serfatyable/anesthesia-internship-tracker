// lib/monitoring/index.ts

import { performanceMonitor, PerformanceMetric } from './performance';
import { healthMonitor, HealthStatus } from './health';
import { errorMonitor, ErrorReport } from './errors';
import { analyticsMonitor, AnalyticsEvent } from './analytics';

export interface MonitoringConfig {
  performance: {
    enabled: boolean;
    sampleRate: number;
    maxMetrics: number;
    flushInterval: number;
  };
  health: {
    enabled: boolean;
    checkInterval: number;
  };
  errors: {
    enabled: boolean;
    maxErrors: number;
    alertThresholds: Record<string, number>;
  };
  analytics: {
    enabled: boolean;
    sampleRate: number;
    maxEvents: number;
    flushInterval: number;
  };
}

class MonitoringService {
  private config: MonitoringConfig;

  constructor(config: Partial<MonitoringConfig> = {}) {
    const isMonitoringDisabled = process.env.DISABLE_MONITORING === 'true';

    this.config = {
      performance: {
        enabled: process.env.NODE_ENV === 'production' && !isMonitoringDisabled,
        sampleRate: 0.1,
        maxMetrics: 1000,
        flushInterval: 120000,
        ...config.performance,
      },
      health: {
        enabled: !isMonitoringDisabled,
        checkInterval: 60000,
        ...config.health,
      },
      errors: {
        enabled: !isMonitoringDisabled,
        maxErrors: 1000,
        alertThresholds: {
          critical: 1,
          high: 5,
          medium: 10,
          low: 50,
        },
        ...config.errors,
      },
      analytics: {
        enabled: process.env.NODE_ENV === 'production' && !isMonitoringDisabled,
        sampleRate: 0.1,
        maxEvents: 10000,
        flushInterval: 180000,
        ...config.analytics,
      },
    };
  }

  // Performance Monitoring
  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    if (this.config.performance.enabled) {
      performanceMonitor.record(name, value, tags);
    }
  }

  async time<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    if (this.config.performance.enabled) {
      return performanceMonitor.time(name, fn, tags);
    }
    return fn();
  }

  timeSync<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    if (this.config.performance.enabled) {
      return performanceMonitor.timeSync(name, fn, tags);
    }
    return fn();
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return performanceMonitor.getMetrics();
  }

  getAggregatedMetrics(): Record<
    string,
    { count: number; avg: number; min: number; max: number; sum: number }
  > {
    return performanceMonitor.getAggregatedMetrics();
  }

  // Health Monitoring
  async getHealthStatus(): Promise<HealthStatus> {
    if (this.config.health.enabled) {
      return healthMonitor.getHealthStatus();
    }
    return {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: 0,
      version: '1.0.0',
      checks: [],
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 },
      },
    };
  }

  // Error Monitoring
  reportError(
    error: Error,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): string {
    if (this.config.errors.enabled) {
      return errorMonitor.report(error, context, severity);
    }
    return '';
  }

  getErrors(filters?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resolved?: boolean;
    limit?: number;
  }): ErrorReport[] {
    return errorMonitor.getErrors(filters);
  }

  getErrorStats(): {
    total: number;
    resolved: number;
    unresolved: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    recent: number;
  } {
    return errorMonitor.getErrorStats();
  }

  resolveError(id: string): boolean {
    return errorMonitor.resolveError(id);
  }

  // Analytics Monitoring
  track(
    name: string,
    properties: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    context: Record<string, any> = {}
  ): string {
    if (this.config.analytics.enabled) {
      return analyticsMonitor.track(
        name,
        properties,
        userId,
        sessionId,
        context
      );
    }
    return '';
  }

  trackPageView(
    page: string,
    title?: string,
    userId?: string,
    sessionId?: string
  ): string {
    if (this.config.analytics.enabled) {
      return analyticsMonitor.trackPageView(page, title, userId, sessionId);
    }
    return '';
  }

  trackAction(
    action: string,
    category?: string,
    label?: string,
    value?: number,
    userId?: string,
    sessionId?: string
  ): string {
    if (this.config.analytics.enabled) {
      return analyticsMonitor.trackAction(
        action,
        category,
        label,
        value,
        userId,
        sessionId
      );
    }
    return '';
  }

  trackAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): string {
    if (this.config.analytics.enabled) {
      return analyticsMonitor.trackAPICall(
        endpoint,
        method,
        statusCode,
        duration,
        userId
      );
    }
    return '';
  }

  trackDatabaseQuery(
    query: string,
    duration: number,
    rowsAffected?: number,
    userId?: string
  ): string {
    if (this.config.analytics.enabled) {
      return analyticsMonitor.trackDatabaseQuery(
        query,
        duration,
        rowsAffected,
        userId
      );
    }
    return '';
  }

  trackError(
    error: Error,
    context: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ): string {
    if (this.config.analytics.enabled) {
      return analyticsMonitor.trackError(error, context, userId, sessionId);
    }
    return '';
  }

  getAnalyticsSummary(timeframe?: number): {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    eventsByType: Record<string, number>;
    topPages: Array<{ page: string; views: number }>;
    topActions: Array<{ action: string; count: number }>;
    errorRate: number;
    avgResponseTime: number;
  } {
    return analyticsMonitor.getSummary(timeframe);
  }

  // Utility methods
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<MonitoringConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      performance: { ...this.config.performance, ...updates.performance },
      health: { ...this.config.health, ...updates.health },
      errors: { ...this.config.errors, ...updates.errors },
      analytics: { ...this.config.analytics, ...updates.analytics },
    };
  }

  // Cleanup
  stop(): void {
    performanceMonitor.stop();
    analyticsMonitor.stop();
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Export individual monitors for direct access if needed
export { performanceMonitor, healthMonitor, errorMonitor, analyticsMonitor };

// Export types
export type { PerformanceMetric, HealthStatus, ErrorReport, AnalyticsEvent };
