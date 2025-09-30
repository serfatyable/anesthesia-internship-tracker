import { prisma } from '@/lib/db';

// Simple in-memory cache for procedures (they don't change often)
let proceduresCache: Array<{
  id: string;
  name: string;
  rotationId: string;
}> | null = null;
let proceduresCacheTimestamp = 0;
const PROCEDURES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function listProceduresActive() {
  const now = Date.now();

  // Return cached data if available and not expired
  if (
    proceduresCache &&
    now - proceduresCacheTimestamp < PROCEDURES_CACHE_TTL
  ) {
    return proceduresCache;
  }

  // Fetch fresh data
  const procedures = await prisma.procedure.findMany({
    where: { rotation: { isActive: true } },
    orderBy: [{ rotationId: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, rotationId: true },
  });

  // Update cache
  proceduresCache = procedures;
  proceduresCacheTimestamp = now;

  return procedures;
}

// Clear cache when procedures are updated
export function clearProceduresCache() {
  proceduresCache = null;
  proceduresCacheTimestamp = 0;
}

export async function listMyLogs(
  internId: string,
  options?: { page?: number; limit?: number }
) {
  const page = Math.max(1, Math.floor(options?.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.floor(options?.limit ?? 50)));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.logEntry.findMany({
      where: { internId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        count: true,
        notes: true,
        procedure: { select: { id: true, name: true } },
        verification: {
          select: { status: true, reason: true, timestamp: true },
        },
      },
      take: limit,
      skip,
    }),
    prisma.logEntry.count({ where: { internId } }),
  ]);

  return { logs, total, page, limit, hasMore: skip + logs.length < total };
}

export async function listPendingLogsForTutor(options?: {
  skip?: number;
  take?: number;
}) {
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
      verification: {
        select: { id: true, status: true, reason: true, timestamp: true },
      },
    },
    skip: options?.skip ?? 0,
    take: options?.take ?? 50,
  });
}
