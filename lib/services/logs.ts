import { prisma } from '@/lib/db';

export async function listProceduresActive() {
  return prisma.procedure.findMany({
    where: { rotation: { isActive: true } },
    orderBy: [{ rotationId: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, rotationId: true },
  });
}

export async function listMyLogs(internId: string) {
  return prisma.logEntry.findMany({
    where: { internId },
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
}

export async function listPendingLogsForTutor() {
  // List logs with PENDING verification
  return prisma.logEntry.findMany({
    where: { verification: { status: 'PENDING' } },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      date: true,
      count: true,
      notes: true,
      intern: { select: { id: true, name: true, email: true } },
      procedure: { select: { id: true, name: true } },
      verification: { select: { id: true, status: true, reason: true, timestamp: true } },
    },
  });
}
