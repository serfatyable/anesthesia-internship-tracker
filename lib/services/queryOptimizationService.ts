import { prisma } from '@/lib/db';

/**
 * Service for optimizing database queries and reducing N+1 problems
 */
export class QueryOptimizationService {
  /**
   * Optimize progress calculations by batching queries
   */
  async getOptimizedProgressData(userId: string) {
    // Use a single query with includes instead of multiple separate queries
    const [user, rotations, logEntries] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
      prisma.rotation.findMany({
        where: { isActive: true },
        include: {
          requirements: {
            include: {
              procedure: true,
            },
          },
        },
      }),
      prisma.logEntry.findMany({
        where: { internId: userId },
        include: {
          procedure: {
            include: {
              rotation: true,
            },
          },
          verification: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { user, rotations, logEntries };
  }

  /**
   * Optimize verification queue with proper indexing and batching
   */
  async getOptimizedVerificationQueue(limit: number = 50) {
    return await prisma.logEntry.findMany({
      where: {
        verification: {
          status: { in: ['PENDING', 'NEEDS_REVISION'] },
        },
      },
      include: {
        intern: {
          select: {
            id: true,
            name: true,
            email: true,
            _count: {
              select: {
                logs: true,
                verifications: true,
              },
            },
          },
        },
        procedure: {
          select: {
            id: true,
            name: true,
            description: true,
            rotation: {
              select: {
                name: true,
              },
            },
          },
        },
        verification: {
          select: {
            status: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  /**
   * Optimize admin dashboard data with efficient queries
   */
  async getOptimizedAdminData() {
    const [
      users,
      rotations,
      procedures,
      requirements,
      logEntryCount,
      pendingVerificationCount,
      recentActivity,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              logs: true,
              verifications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit for performance
      }),
      prisma.rotation.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              procedures: true,
              requirements: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.procedure.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          rotationId: true,
          createdAt: true,
          _count: {
            select: {
              logs: true,
              requirements: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.requirement.findMany({
        select: {
          id: true,
          minCount: true,
          trainingLevel: true,
          rotation: {
            select: { name: true },
          },
          procedure: {
            select: { name: true },
          },
        },
        orderBy: { id: 'desc' },
        take: 200,
      }),
      prisma.logEntry.count(),
      prisma.verification.count({
        where: { status: 'PENDING' },
      }),
      prisma.logEntry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          intern: { select: { name: true, email: true } },
          procedure: { select: { name: true } },
          verification: { select: { status: true } },
          notes: true,
        },
      }),
    ]);

    return {
      users,
      rotations,
      procedures,
      requirements,
      logEntryCount,
      pendingVerificationCount,
      recentActivity,
    };
  }

  /**
   * Optimize audit logs with proper pagination and filtering
   */
  async getOptimizedAuditLogs(
    entity?: string,
    entityId?: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const where = entity && entityId ? { entity, entityId } : {};

    return await prisma.audit.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Batch update operations to reduce database round trips
   */
  async batchUpdateVerifications(
    updates: Array<{
      id: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
      reason?: string;
      verifierId: string;
    }>,
  ) {
    const promises = updates.map(({ id, status, reason, verifierId }) =>
      prisma.verification.update({
        where: { id },
        data: {
          status,
          reason: reason || null,
          verifierId,
          timestamp: new Date(),
        },
      }),
    );

    return await Promise.all(promises);
  }

  /**
   * Get paginated results with proper cursor-based pagination
   */
  async getPaginatedResults<T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: any = {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy: any = { createdAt: 'desc' },
    limit: number = 50,
    cursor?: string,
  ): Promise<{ data: T[]; nextCursor?: string; hasMore: boolean }> {
    const results = await model.findMany({
      where,
      orderBy,
      take: limit + 1, // Take one extra to check if there are more
      ...(cursor && { cursor: { id: cursor } }),
    });

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, -1) : results;
    const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

    return { data, nextCursor, hasMore };
  }
}

export const queryOptimizationService = new QueryOptimizationService();
