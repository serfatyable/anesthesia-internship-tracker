/**
 * Advanced analytics and monitoring system
 */
import { monitoring } from '@/lib/utils/monitoring';
import { logger } from '@/lib/utils/logger';

interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryUsage: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface UserBehavior {
  userId: string;
  action: string;
  page: string;
  timestamp: number;
  properties?: Record<string, unknown>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private userBehaviors: UserBehavior[] = [];
  private maxEvents = 10000;

  // Track custom events
  trackEvent(name: string, properties: Record<string, unknown> = {}, userId?: string): void {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      userId,
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Record in monitoring system
    monitoring.recordMetric('analytics.event', 1, {
      eventName: name,
      userId: userId || 'anonymous',
    });

    logger.debug('Analytics event tracked', {
      operation: 'analytics',
      eventName: name,
      userId,
      properties,
    });
  }

  // Track user behavior
  trackUserBehavior(
    userId: string,
    action: string,
    page: string,
    properties: Record<string, unknown> = {},
  ): void {
    const behavior: UserBehavior = {
      userId,
      action,
      page,
      timestamp: Date.now(),
      properties,
    };

    this.userBehaviors.push(behavior);

    // Keep only recent behaviors
    if (this.userBehaviors.length > this.maxEvents) {
      this.userBehaviors = this.userBehaviors.slice(-this.maxEvents);
    }

    // Record in monitoring system
    monitoring.recordMetric('analytics.user_behavior', 1, {
      action,
      page,
      userId,
    });

    logger.debug('User behavior tracked', {
      operation: 'analytics',
      userId,
      action,
      page,
      properties,
    });
  }

  // Track performance metrics
  trackPerformance(
    operation: string,
    duration: number,
    memoryUsage?: number,
    metadata?: Record<string, unknown>,
  ): void {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      memoryUsage: memoryUsage || process.memoryUsage().heapUsed,
      timestamp: Date.now(),
      metadata,
    };

    this.performanceMetrics.push(metric);

    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxEvents) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxEvents);
    }

    // Record in monitoring system
    monitoring.recordMetric('analytics.performance', duration, {
      operation,
      memoryUsage: metric.memoryUsage,
    });

    // Log slow operations
    if (duration > 1000) {
      logger.warn('Slow operation detected', {
        operation: 'analytics',
        operationName: operation,
        duration,
        memoryUsage: metric.memoryUsage,
        metadata,
      });
    }
  }

  // Get analytics data
  getAnalytics(timeRange?: { start: number; end: number }): {
    events: AnalyticsEvent[];
    performance: PerformanceMetrics[];
    userBehaviors: UserBehavior[];
  } {
    const filter = (items: unknown[]) => {
      if (!timeRange) return items;
      return items.filter(
        (item) => item.timestamp >= timeRange.start && item.timestamp <= timeRange.end,
      );
    };

    return {
      events: filter(this.events),
      performance: filter(this.performanceMetrics),
      userBehaviors: filter(this.userBehaviors),
    };
  }

  // Get event statistics
  getEventStats(timeRange?: { start: number; end: number }): Record<string, number> {
    const events = timeRange
      ? this.events.filter((e) => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
      : this.events;

    const stats: Record<string, number> = {};
    events.forEach((event) => {
      stats[event.name] = (stats[event.name] || 0) + 1;
    });

    return stats;
  }

  // Get performance statistics
  getPerformanceStats(timeRange?: { start: number; end: number }): Record<
    string,
    {
      count: number;
      avgDuration: number;
      maxDuration: number;
      minDuration: number;
      avgMemoryUsage: number;
    }
  > {
    const metrics = timeRange
      ? this.performanceMetrics.filter(
          (m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end,
        )
      : this.performanceMetrics;

    const stats: Record<
      string,
      {
        count: number;
        totalDuration: number;
        maxDuration: number;
        minDuration: number;
        totalMemoryUsage: number;
        avgDuration?: number;
        avgMemoryUsage?: number;
      }
    > = {};

    metrics.forEach((metric) => {
      if (!stats[metric.operation]) {
        stats[metric.operation] = {
          count: 0,
          totalDuration: 0,
          maxDuration: 0,
          minDuration: Infinity,
          totalMemoryUsage: 0,
        };
      }

      const stat = stats[metric.operation];
      stat.count++;
      stat.totalDuration += metric.duration;
      stat.maxDuration = Math.max(stat.maxDuration, metric.duration);
      stat.minDuration = Math.min(stat.minDuration, metric.duration);
      stat.totalMemoryUsage += metric.memoryUsage;
    });

    // Calculate averages
    Object.keys(stats).forEach((operation) => {
      const stat = stats[operation]!;
      stat.avgDuration = stat.totalDuration / stat.count;
      stat.avgMemoryUsage = stat.totalMemoryUsage / stat.count;
      stat.minDuration = stat.minDuration === Infinity ? 0 : stat.minDuration;
      delete stat.totalDuration;
      delete stat.totalMemoryUsage;
    });

    return stats;
  }

  // Get user behavior insights
  getUserBehaviorInsights(timeRange?: { start: number; end: number }): {
    topActions: Array<{ action: string; count: number }>;
    topPages: Array<{ page: string; count: number }>;
    activeUsers: number;
    averageActionsPerUser: number;
  } {
    const behaviors = timeRange
      ? this.userBehaviors.filter(
          (b) => b.timestamp >= timeRange.start && b.timestamp <= timeRange.end,
        )
      : this.userBehaviors;

    const actionCounts: Record<string, number> = {};
    const pageCounts: Record<string, number> = {};
    const userActions: Record<string, number> = {};

    behaviors.forEach((behavior) => {
      actionCounts[behavior.action] = (actionCounts[behavior.action] || 0) + 1;
      pageCounts[behavior.page] = (pageCounts[behavior.page] || 0) + 1;
      userActions[behavior.userId] = (userActions[behavior.userId] || 0) + 1;
    });

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topPages = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const activeUsers = Object.keys(userActions).length;
    const averageActionsPerUser =
      activeUsers > 0
        ? Object.values(userActions).reduce((sum, count) => sum + count, 0) / activeUsers
        : 0;

    return {
      topActions,
      topPages,
      activeUsers,
      averageActionsPerUser: Math.round(averageActionsPerUser * 100) / 100,
    };
  }

  // Clear old data
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;

    this.events = this.events.filter((event) => event.timestamp > cutoff);
    this.performanceMetrics = this.performanceMetrics.filter((metric) => metric.timestamp > cutoff);
    this.userBehaviors = this.userBehaviors.filter((behavior) => behavior.timestamp > cutoff);
  }

  // Export data for external analysis
  exportData(): {
    events: AnalyticsEvent[];
    performance: PerformanceMetrics[];
    userBehaviors: UserBehavior[];
    exportedAt: number;
  } {
    return {
      events: [...this.events],
      performance: [...this.performanceMetrics],
      userBehaviors: [...this.userBehaviors],
      exportedAt: Date.now(),
    };
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, unknown>, userId?: string) =>
  analytics.trackEvent(name, properties, userId);

export const trackUserBehavior = (
  userId: string,
  action: string,
  page: string,
  properties?: Record<string, unknown>,
) => analytics.trackUserBehavior(userId, action, page, properties);

export const trackPerformanceMetric = (
  operation: string,
  duration: number,
  memoryUsage?: number,
  metadata?: Record<string, unknown>,
) => analytics.trackPerformance(operation, duration, memoryUsage, metadata);

// Performance tracking decorator
export function trackPerformance<T extends (...args: unknown[]) => unknown>(
  fn: T,
  operationName: string,
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result
          .then((resolved) => {
            const duration = performance.now() - start;
            const endMemory = process.memoryUsage().heapUsed;
            trackPerformance(operationName, duration, endMemory - startMemory);
            return resolved;
          })
          .catch((error) => {
            const duration = performance.now() - start;
            const endMemory = process.memoryUsage().heapUsed;
            trackPerformance(operationName, duration, endMemory - startMemory, { error: true });
            throw error;
          });
      }

      const duration = performance.now() - start;
      const endMemory = process.memoryUsage().heapUsed;
      trackPerformance(operationName, duration, endMemory - startMemory);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      const endMemory = process.memoryUsage().heapUsed;
      trackPerformance(operationName, duration, endMemory - startMemory, { error: true });
      throw error;
    }
  }) as T;
}

// Cleanup old data periodically
setInterval(
  () => {
    analytics.cleanup();
  },
  60 * 60 * 1000,
); // Every hour
