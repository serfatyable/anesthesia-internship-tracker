// lib/monitoring/production.ts
import { monitoring } from './index';
import { logger } from '@/lib/utils/logger';

/**
 * Production monitoring configuration and utilities
 */

interface ProductionMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  responseTime: number;
  errorRate: number;
  requestCount: number;
}

class ProductionMonitor {
  private startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];

  /**
   * Track a request for monitoring
   */
  trackRequest(responseTime: number, isError = false) {
    this.requestCount++;
    if (isError) this.errorCount++;
    this.responseTimes.push(responseTime);

    // Keep only last 1000 response times for memory efficiency
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  /**
   * Get current production metrics
   */
  getMetrics(): ProductionMetrics {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) /
          this.responseTimes.length
        : 0;
    const errorRate =
      this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    return {
      uptime,
      memoryUsage,
      cpuUsage,
      responseTime: avgResponseTime,
      errorRate,
      requestCount: this.requestCount,
    };
  }

  /**
   * Check if the application is healthy
   */
  isHealthy(): boolean {
    const metrics = this.getMetrics();

    // Check memory usage (alert if over 80%)
    const memoryUsagePercent =
      (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      logger.warn('High memory usage detected', {
        memoryUsagePercent,
        heapUsed: metrics.memoryUsage.heapUsed,
        heapTotal: metrics.memoryUsage.heapTotal,
      });
      return false;
    }

    // Check error rate (alert if over 5%)
    if (metrics.errorRate > 5) {
      logger.warn('High error rate detected', {
        errorRate: metrics.errorRate,
        requestCount: metrics.requestCount,
        errorCount: this.errorCount,
      });
      return false;
    }

    // Check response time (alert if over 5 seconds)
    if (metrics.responseTime > 5000) {
      logger.warn('High response time detected', {
        responseTime: metrics.responseTime,
        requestCount: metrics.requestCount,
      });
      return false;
    }

    return true;
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];

    const memoryUsagePercent =
      (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent > 70) {
      recommendations.push(
        'Consider increasing memory allocation or optimizing memory usage'
      );
    }

    if (metrics.errorRate > 2) {
      recommendations.push(
        'Investigate and fix error sources to reduce error rate'
      );
    }

    if (metrics.responseTime > 2000) {
      recommendations.push(
        'Optimize database queries and API responses to improve performance'
      );
    }

    if (metrics.requestCount > 10000 && metrics.uptime < 3600000) {
      // 1 hour
      recommendations.push(
        'Consider implementing rate limiting for high traffic'
      );
    }

    return recommendations;
  }
}

// Global production monitor instance
export const productionMonitor = new ProductionMonitor();

/**
 * Middleware to track production metrics
 */
export function trackProductionMetrics(req: any, res: any, next: any) {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const isError = res.statusCode >= 400;

    productionMonitor.trackRequest(responseTime, isError);

    // Track in monitoring system
    monitoring.trackAPICall(req.path, req.method, res.statusCode, responseTime);

    if (isError) {
      monitoring.trackError(new Error(`HTTP ${res.statusCode}`), {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
      });
    }
  });

  next();
}

/**
 * Health check endpoint for production
 */
export function getProductionHealthCheck() {
  const metrics = productionMonitor.getMetrics();
  const isHealthy = productionMonitor.isHealthy();
  const recommendations = productionMonitor.getRecommendations();

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    metrics,
    recommendations,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Performance monitoring for specific operations
 */
export class PerformanceTracker {
  private static timers = new Map<string, number>();

  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  static endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      logger.warn(`Timer not found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);

    // Track in monitoring system
    monitoring.recordMetric(`operation.${operation}`, duration);

    return duration;
  }

  static async time<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(operation);
    try {
      const result = await fn();
      const duration = this.endTimer(operation);
      logger.debug(`Operation completed: ${operation}`, { duration });
      return result;
    } catch (error) {
      this.endTimer(operation);
      throw error;
    }
  }
}

/**
 * Memory monitoring utilities
 */
export class MemoryMonitor {
  private static lastGC = Date.now();
  private static gcThreshold = 60000; // 1 minute

  static checkMemoryUsage(): void {
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent =
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent > 80) {
      logger.warn('High memory usage detected', {
        memoryUsagePercent,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      });

      // Force garbage collection if available
      if (global.gc && Date.now() - this.lastGC > this.gcThreshold) {
        global.gc();
        this.lastGC = Date.now();
        logger.info('Garbage collection triggered');
      }
    }
  }

  static getMemoryStats() {
    const memoryUsage = process.memoryUsage();
    return {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss,
      usagePercent: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
    };
  }
}

/**
 * Initialize production monitoring
 */
export function initializeProductionMonitoring() {
  // Set up memory monitoring
  setInterval(() => {
    MemoryMonitor.checkMemoryUsage();
  }, 30000); // Check every 30 seconds

  // Set up health check logging
  setInterval(() => {
    const health = getProductionHealthCheck();
    if (!health.status) {
      logger.error('Health check failed', { health });
    }
  }, 60000); // Check every minute

  logger.info('Production monitoring initialized');
}
