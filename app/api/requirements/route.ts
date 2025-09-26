import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const gate = await requireRole('ADMIN');
  if (!gate.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { rotationId, procedureId, minCount, trainingLevel } = await req.json();
  const created = await prisma.requirement.create({
    data: { rotationId, procedureId, minCount, trainingLevel },
  });
  return NextResponse.json(created, { status: 201 });
}
