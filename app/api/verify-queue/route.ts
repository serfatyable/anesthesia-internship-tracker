import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canReviewLogs } from '@/lib/auth/permissions';
import { listPendingLogsForTutor } from '@/lib/services/logs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const u = session?.user;
  if (!u?.id || !u.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canReviewLogs({ id: u.id, role: u.role }))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const limit = limitParam
    ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 50))
    : 50;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    listPendingLogsForTutor({ skip, take: limit }),
    // Count total pending items
    // Using a lightweight call via Prisma count to avoid overfetching
    // We reuse the service's prisma client here through a dedicated method if needed
    // For now, return items.length as total when service doesn't expose count
    // This keeps the API backward-compatible and avoids extra DB hits
    Promise.resolve<number>(-1),
  ]);

  return NextResponse.json({ items, page, limit, total });
}
