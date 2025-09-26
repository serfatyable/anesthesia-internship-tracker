import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { canReviewLogs } from '@/lib/auth/permissions';
import { queryOptimizationService } from '@/lib/services/queryOptimizationService';
import { cacheService } from '@/lib/services/cacheService';
import { addPerformanceHeaders } from '@/lib/middleware/compression';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const u = session?.user;
    if (!u?.id || !u.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canReviewLogs({ id: u.id, role: u.role }))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Check cache first
    const cached = await cacheService.getCachedVerificationQueue();
    if (cached) {
      return addPerformanceHeaders(NextResponse.json({ items: cached }));
    }

    // Use optimized query service
    const items = await queryOptimizationService.getOptimizedVerificationQueue();

    // Cache the result
    await cacheService.cacheVerificationQueue(items);

    return addPerformanceHeaders(NextResponse.json({ items }));
  } catch (error: unknown) {
    console.error('Verify queue API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
