import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { CreateLogSchema } from '@/lib/validators/logs';
import { auditService } from '@/lib/services/auditService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Verify the user exists in DB
    const me = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const logs = await prisma.logEntry.findMany({
      where: { internId: me.id },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        count: true,
        notes: true,
        procedure: { select: { id: true, name: true } },
        verification: { select: { status: true, reason: true, timestamp: true } },
      },
    });
    return NextResponse.json({ logs });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load logs' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = CreateLogSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const me = await prisma.user.findUnique({ where: { id: session.user!.id } });
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { procedureId, date, count, notes } = parsed.data;
    const when = new Date(date);
    const created = await prisma.logEntry.create({
      data: {
        internId: me.id,
        procedureId,
        date: when,
        count,
        notes: notes || null,
        verification: { create: { status: 'PENDING', verifierId: null } },
      },
      select: { id: true },
    });

    // Log audit event
    await auditService.logLogCreated(
      me.id,
      created.id,
      `Created log entry for procedure ${procedureId} with count ${count}`,
    );

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create log' },
      { status: 500 },
    );
  }
}
