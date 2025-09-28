import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canReviewLogs } from '@/lib/auth/permissions';
import { listPendingLogsForTutor } from '@/lib/services/logs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const u = session?.user;
  if (!u?.id || !u.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canReviewLogs({ id: u.id, role: u.role }))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const items = await listPendingLogsForTutor();
  return NextResponse.json({ items });
}
