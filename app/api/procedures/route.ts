import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const procedures = await prisma.procedure.findMany({
    where: { rotation: { isActive: true } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ procedures });
}
