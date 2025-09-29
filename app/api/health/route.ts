/**
 * Health check and monitoring endpoint
 */
import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';
import { monitoring } from '@/lib/utils/monitoring';
import { getCacheMemoryUsage } from '@/lib/utils/cache';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = performance.now();

  try {
    // Check database health
    const dbHealth = await checkDatabaseHealth();

    // Get cache statistics
    const cacheStats = getCacheMemoryUsage();

    // Get monitoring metrics
    const monitoringStats = monitoring.getAllMetrics();

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    // Get uptime
    const uptime = process.uptime();

    // Calculate response time
    const responseTime = performance.now() - startTime;

    // Determine overall health status
    const isHealthy = dbHealth.status === 'healthy' && memoryUsage.heapUsed < 100 * 1024 * 1024; // Less than 100MB heap usage

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      responseTime: Math.round(responseTime),
      database: {
        status: dbHealth.status,
        connected: dbHealth.connected,
        error: dbHealth.error,
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
      cache: {
        totalMemory: Math.round(cacheStats.total / 1024 / 1024), // MB
        breakdown: Object.fromEntries(
          Object.entries(cacheStats.breakdown).map(([key, value]) => [
            key,
            Math.round(value / 1024 / 1024), // MB
          ]),
        ),
      },
      metrics: {
        totalRequests: Object.values(monitoringStats).reduce(
          (total, metrics) => total + metrics.length,
          0,
        ),
        errorRate: calculateErrorRate(monitoringStats),
        averageResponseTime: calculateAverageResponseTime(monitoringStats),
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Log health check
    logger.info('Health check performed', {
      operation: 'health_check',
      status: healthData.status,
      responseTime: healthData.responseTime,
      memoryUsage: healthData.memory.heapUsed,
    });

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    logger.error('Health check failed', {
      operation: 'health_check',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  }
}

// Calculate error rate from monitoring data
function calculateErrorRate(metrics: Record<string, unknown[]>): number {
  const errorMetrics = metrics['error_rate'] || [];
  const totalMetrics = Object.values(metrics).reduce(
    (total, metricArray) => total + metricArray.length,
    0,
  );

  if (totalMetrics === 0) return 0;

  const totalErrors = (errorMetrics as Array<{ value?: unknown }>).reduce(
    (sum: number, metric) => sum + (Number(metric.value) || 0),
    0,
  );
  return Math.round((totalErrors / totalMetrics) * 100 * 100) / 100; // Percentage with 2 decimal places
}

// Calculate average response time from monitoring data
function calculateAverageResponseTime(metrics: Record<string, unknown[]>): number {
  const responseTimeMetrics = metrics['performance.api'] || [];

  if (responseTimeMetrics.length === 0) return 0;

  const totalTime = (responseTimeMetrics as Array<{ value?: unknown }>).reduce(
    (sum: number, metric) => sum + (Number(metric.value) || 0),
    0,
  );
  return Math.round(totalTime / responseTimeMetrics.length);
}
