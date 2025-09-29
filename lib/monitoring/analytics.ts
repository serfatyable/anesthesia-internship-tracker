// lib/monitoring/analytics.ts

interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  context: {
    userAgent?: string;
    ip?: string;
    url?: string;
    referrer?: string;
  };
}

interface AnalyticsConfig {
  enabled: boolean;
  sampleRate: number;
  maxEvents: number;
  flushInterval: number;
  batchSize: number;
}

class AnalyticsMonitor {
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      sampleRate: 1.0,
      maxEvents: 10000,
      flushInterval: 60000, // 1 minute
      batchSize: 100,
      ...config,
    };

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Track an event
   */
  track(
    name: string,
    properties: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    context: Partial<AnalyticsEvent['context']> = {}
  ): string {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return '';
    }

    const eventId = this.generateEventId();
    const now = Date.now();

    const event: AnalyticsEvent = {
      id: eventId,
      name,
      properties: {
        ...properties,
        timestamp: now,
      },
      userId,
      sessionId,
      timestamp: now,
      context: {
        userAgent: context.userAgent || this.getUserAgent(),
        ip: context.ip || this.getClientIP(),
        url: context.url || this.getCurrentURL(),
        referrer: context.referrer || this.getReferrer(),
      },
    };

    this.events.push(event);

    // Keep only the most recent events
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }

    return eventId;
  }

  /**
   * Track page view
   */
  trackPageView(
    page: string,
    title?: string,
    userId?: string,
    sessionId?: string
  ): string {
    return this.track('page_view', {
      page,
      title: title || page,
    }, userId, sessionId);
  }

  /**
   * Track user action
   */
  trackAction(
    action: string,
    category?: string,
    label?: string,
    value?: number,
    userId?: string,
    sessionId?: string
  ): string {
    return this.track('user_action', {
      action,
      category,
      label,
      value,
    }, userId, sessionId);
  }

  /**
   * Track API call
   */
  trackAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): string {
    return this.track('api_call', {
      endpoint,
      method,
      statusCode,
      duration,
      success: statusCode >= 200 && statusCode < 400,
    }, userId);
  }

  /**
   * Track database query
   */
  trackDatabaseQuery(
    query: string,
    duration: number,
    rowsAffected?: number,
    userId?: string
  ): string {
    return this.track('database_query', {
      query: query.substring(0, 100), // Truncate for privacy
        duration,
      rowsAffected,
    }, userId);
  }

  /**
   * Track error
   */
  trackError(
    error: Error,
    context: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ): string {
    return this.track('error', {
      message: error.message,
      type: error.constructor.name,
      stack: error.stack?.substring(0, 500), // Truncate for privacy
      ...context,
    }, userId, sessionId);
  }

  /**
   * Get events
   */
  getEvents(filters?: {
    name?: string;
    userId?: string;
    sessionId?: string;
    limit?: number;
    since?: number;
  }): AnalyticsEvent[] {
    let filtered = [...this.events];

    if (filters?.name) {
      filtered = filtered.filter(event => event.name === filters.name);
    }

    if (filters?.userId) {
      filtered = filtered.filter(event => event.userId === filters.userId);
    }

    if (filters?.sessionId) {
      filtered = filtered.filter(event => event.sessionId === filters.sessionId);
    }

    if (filters?.since) {
      filtered = filtered.filter(event => event.timestamp >= filters.since!);
    }

    if (filters?.limit) {
      filtered = filtered.slice(-filters.limit);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get analytics summary
   */
  getSummary(timeframe: number = 24 * 60 * 60 * 1000): {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    eventsByType: Record<string, number>;
    topPages: Array<{ page: string; views: number }>;
    topActions: Array<{ action: string; count: number }>;
    errorRate: number;
    avgResponseTime: number;
  } {
    const since = Date.now() - timeframe;
    const recentEvents = this.events.filter(event => event.timestamp >= since);

    const uniqueUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(recentEvents.map(e => e.sessionId).filter(Boolean)).size;

    const eventsByType: Record<string, number> = {};
    const pageViews: Record<string, number> = {};
    const actions: Record<string, number> = {};
    let errorCount = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    for (const event of recentEvents) {
      eventsByType[event.name] = (eventsByType[event.name] || 0) + 1;

      if (event.name === 'page_view') {
        const page = event.properties.page;
        if (page) {
          pageViews[page] = (pageViews[page] || 0) + 1;
        }
      }

      if (event.name === 'user_action') {
        const action = event.properties.action;
        if (action) {
          actions[action] = (actions[action] || 0) + 1;
        }
      }

      if (event.name === 'error') {
        errorCount++;
      }

      if (event.name === 'api_call' && event.properties.duration) {
        totalResponseTime += event.properties.duration;
        responseTimeCount++;
      }
    }

    const topPages = Object.entries(pageViews)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const topActions = Object.entries(actions)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const errorRate = recentEvents.length > 0 ? (errorCount / recentEvents.length) * 100 : 0;
    const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    return {
      totalEvents: recentEvents.length,
      uniqueUsers,
      uniqueSessions,
      eventsByType,
      topPages,
      topActions,
      errorRate,
      avgResponseTime,
    };
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user agent from request
   */
  private getUserAgent(): string | undefined {
    // In a real implementation, you would get this from the request headers
    return undefined;
  }

  /**
   * Get client IP from request
   */
  private getClientIP(): string | undefined {
    // In a real implementation, you would get this from the request
    return undefined;
  }

  /**
   * Get current URL
   */
  private getCurrentURL(): string | undefined {
    // In a real implementation, you would get this from the request
    return undefined;
  }

  /**
   * Get referrer
   */
  private getReferrer(): string | undefined {
    // In a real implementation, you would get this from the request headers
    return undefined;
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
   * Flush events to external service
   */
  private async flush(): Promise<void> {
    if (this.events.length === 0) {
      return;
    }

    try {
      // In a real implementation, you would send events to your analytics service
      // For now, we'll just log them
      console.log(`[AnalyticsMonitor] Flushing ${this.events.length} events`);
      
      // Clear events after flushing
      this.events = [];
    } catch (error) {
      console.error('[AnalyticsMonitor] Failed to flush events:', error);
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
export const analyticsMonitor = new AnalyticsMonitor();

// Export types
export type { AnalyticsEvent, AnalyticsConfig };