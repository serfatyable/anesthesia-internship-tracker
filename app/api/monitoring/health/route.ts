// app/api/monitoring/health/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const healthStatus = await monitoring.getHealthStatus();
    
    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
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
