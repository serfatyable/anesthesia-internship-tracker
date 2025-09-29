// app/api/monitoring/metrics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let data: any = {};

    switch (type) {
      case 'performance':
        data = {
          metrics: monitoring.getPerformanceMetrics(),
          aggregated: monitoring.getAggregatedMetrics(),
        };
        break;

      case 'errors':
        data = {
          errors: monitoring.getErrors({ limit: 100 }),
          stats: monitoring.getErrorStats(),
        };
        break;

      case 'analytics':
        const timeframe = searchParams.get('timeframe');
        const hours = timeframe ? parseInt(timeframe) : 24;
        data = monitoring.getAnalyticsSummary(hours * 60 * 60 * 1000);
        break;

      case 'all':
      default:
        data = {
          performance: {
            metrics: monitoring.getPerformanceMetrics(),
            aggregated: monitoring.getAggregatedMetrics(),
          },
          errors: {
            errors: monitoring.getErrors({ limit: 100 }),
            stats: monitoring.getErrorStats(),
          },
          analytics: monitoring.getAnalyticsSummary(24 * 60 * 60 * 1000),
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Metrics retrieval failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
