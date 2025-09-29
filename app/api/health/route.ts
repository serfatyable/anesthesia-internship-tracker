/**
 * Health check and monitoring endpoint
 */
import { NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Track the health check request
    const startTime = performance.now();

    const healthStatus = await monitoring.time('health_check', async () => {
      return monitoring.getHealthStatus();
    });

    const responseTime = performance.now() - startTime;

    // Track the API call
    monitoring.trackAPICall('/api/health', 'GET', 200, responseTime);

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    // Track the error
    monitoring.trackError(
      error instanceof Error ? error : new Error('Unknown error'),
      {
        endpoint: '/api/health',
        method: 'GET',
      }
    );

    return NextResponse.json(
      {
        status: 'unhealthy',
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
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
