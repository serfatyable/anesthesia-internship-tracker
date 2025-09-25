import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { canReviewLogs } from '@/lib/auth/permissions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const u = session?.user;
  if (!u?.id || !u.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canReviewLogs({ id: u.id, role: u.role }))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const items = await prisma.logEntry.findMany({
    where: { verification: { status: 'PENDING' } },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      date: true,
      count: true,
      notes: true,
      intern: { select: { id: true, name: true, email: true } },
      procedure: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ items });
}
