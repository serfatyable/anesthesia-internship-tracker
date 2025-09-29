import { prisma } from '@/lib/db';
import {
  ProgressSummary,
  RotationProgress,
  PendingVerification,
  RecentActivity,
  InternSummary,
  DashboardOverview,
  InternDashboard,
  LogExportRow,
  VerificationStatus,
  ExportParams,
  calculateCompletionPercentage,
  formatDateForCSV,
} from '@/lib/domain/progress';
import { CACHE_TTL, VERIFICATION_STATUS } from '@/lib/constants';
import { monitorDatabaseQuery } from '@/lib/utils/performance';
import { userCache, rotationCache, procedureCache } from '@/lib/utils/cache';
import { monitoring } from '@/lib/utils/monitoring';

export class ProgressService {
  // Cache for rotations data (they don't change often)
  private static rotationsCache: Array<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    state: string;
    requirements: Array<{
      id: string;
      minCount: number;
      procedure: { id: string; name: string };
    }>;
  }> | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_TTL = CACHE_TTL.ROTATIONS;

  // Cache for procedures data
  private static proceduresCache: Array<{
    id: string;
    name: string;
    rotationId: string;
  }> | null = null;
  private static proceduresCacheTimestamp: number = 0;
  private static readonly PROCEDURES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache for user data
  private static userCache: Map<
    string,
    {
      name: string | null;
      email: string;
      createdAt: Date;
    }
  > = new Map();
  private static userCacheTimestamp: number = 0;
  private static readonly USER_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  /**
   * Get cached user data or fetch from database
   */
  private async getCachedUser(userId: string) {
    // Try to get from advanced cache first
    const cachedUser = userCache.get(userId);
    if (cachedUser) {
      monitoring.recordMetric('cache.hit', 1, { type: 'user' });
      return cachedUser;
    }

    monitoring.recordMetric('cache.miss', 1, { type: 'user' });

    // Fetch fresh data with performance monitoring
    const user = await monitorDatabaseQuery('getUser', () =>
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, createdAt: true },
      }),
    );

    if (user) {
      const userData = {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };
      userCache.set(userId, userData);
      return userData;
    }

    return null;
  }

  /**
   * Get cached procedures or fetch from database
   */
  private async getCachedProcedures() {
    const cacheKey = 'all_procedures';
    const cachedProcedures = procedureCache.get(cacheKey);

    if (cachedProcedures) {
      monitoring.recordMetric('cache.hit', 1, { type: 'procedures' });
      return cachedProcedures;
    }

    monitoring.recordMetric('cache.miss', 1, { type: 'procedures' });

    const procedures = await monitorDatabaseQuery('getProcedures', () =>
      prisma.procedure.findMany({
        where: { rotation: { isActive: true } },
        select: { id: true, name: true, description: true, rotationId: true },
        orderBy: [{ rotationId: 'asc' }, { name: 'asc' }],
      }),
    );

    procedureCache.set(cacheKey, procedures);
    return procedures;
  }

  /**
   * Get cached rotations or fetch from database
   */
  private async getCachedRotations() {
    const cacheKey = 'all_rotations';
    const cachedRotations = rotationCache.get(cacheKey);

    if (cachedRotations) {
      monitoring.recordMetric('cache.hit', 1, { type: 'rotations' });
      return cachedRotations;
    }

    monitoring.recordMetric('cache.miss', 1, { type: 'rotations' });

    const rotations = await monitorDatabaseQuery('getRotations', () =>
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
    );

    rotationCache.set(cacheKey, rotations);
    return rotations;
  }

  /**
   * Get progress data for a specific intern - Optimized version
   */
  async getInternProgress(userId: string): Promise<InternDashboard> {
    const startTime = performance.now();

    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID provided');
      }

      monitoring.recordMetric('api.getInternProgress.start', 1);

      // Get cached rotations data
      const rotations = await this.getCachedRotations();

      // Optimized query with better indexing and selective fields
      const logEntries = await prisma.logEntry.findMany({
        where: {
          internId: userId,
          // Only get entries from the last 2 years for performance
          date: {
            gte: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          count: true,
          date: true,
          notes: true,
          createdAt: true,
          procedure: {
            select: {
              id: true,
              name: true,
              rotationId: true,
              rotation: {
                select: {
                  id: true,
                  name: true,
                  state: true,
                },
              },
            },
          },
          verification: {
            select: {
              id: true,
              status: true,
              timestamp: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: 1000, // Increased limit with better performance
      });

      // Pre-group log entries by rotation ID for better performance
      const logsByRotation = new Map<string, typeof logEntries>();
      logEntries.forEach((log) => {
        const rotationId = log.procedure.rotationId;
        if (!logsByRotation.has(rotationId)) {
          logsByRotation.set(rotationId, []);
        }
        logsByRotation.get(rotationId)!.push(log);
      });

      // Calculate progress per rotation
      const rotationProgress: RotationProgress[] = await Promise.all(
        rotations.map(async (rotation) => {
          const requirements = rotation.requirements;
          const totalRequired = requirements.reduce(
            (sum: number, req: { minCount: number }) => sum + req.minCount,
            0,
          );

          // Get logs for this rotation from pre-grouped data
          const rotationLogs = logsByRotation.get(rotation.id) || [];

          const verified = rotationLogs
            .filter((log) => log.verification?.status === VERIFICATION_STATUS.APPROVED)
            .reduce((sum, log) => sum + log.count, 0);

          const pending = rotationLogs
            .filter((log) => log.verification?.status === VERIFICATION_STATUS.PENDING)
            .reduce((sum, log) => sum + log.count, 0);

          // Calculate current interns in this rotation (based on recent activity)
          const procedureIds = requirements.map((req) => req.procedureId);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentInterns = await prisma.logEntry.findMany({
            where: {
              procedureId: { in: procedureIds },
              date: { gte: thirtyDaysAgo },
            },
            select: { internId: true },
            distinct: ['internId'],
          });

          const currentInterns = recentInterns.length;

          return {
            rotationId: rotation.id,
            rotationName: rotation.name,
            required: totalRequired,
            verified,
            pending,
            completionPercentage: calculateCompletionPercentage(verified, totalRequired),
            state: rotation.state,
            currentInterns,
          };
        }),
      );

      // Calculate overall summary
      const totalRequired = rotationProgress.reduce((sum, r) => sum + r.required, 0);
      const totalVerified = rotationProgress.reduce((sum, r) => sum + r.verified, 0);
      const totalPending = rotationProgress.reduce((sum, r) => sum + r.pending, 0);

      const summary: ProgressSummary = {
        totalRequired,
        totalVerified,
        totalPending,
        completionPercentage: calculateCompletionPercentage(totalVerified, totalRequired),
      };

      // Get pending verifications (latest 5)
      const pendingVerifications = await this.getPendingVerifications(userId, 5);

      // Get recent activity (latest 10)
      const recentActivity = await this.getRecentActivity(userId, 10);

      // Get user information (cached)
      const userInfo = await this.getCachedUser(userId);

      const duration = performance.now() - startTime;
      monitoring.recordMetric('api.getInternProgress.duration', duration);
      monitoring.recordMetric('api.getInternProgress.success', 1);

      return {
        summary,
        rotations: rotationProgress,
        pendingVerifications,
        recentActivity,
        userInfo: userInfo || undefined,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      monitoring.recordMetric('api.getInternProgress.duration', duration);
      monitoring.recordMetric('api.getInternProgress.error', 1);

      console.error('Error in getInternProgress:', error);
      throw new Error(
        `Failed to get intern progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get dashboard overview for tutors/admins - optimized to avoid N+1 queries
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      // Execute all queries in parallel to minimize database round trips
      const [interns, totalPendingVerifications, last7DaysActivity, allRotations] =
        await Promise.all([
          // Get all interns
          prisma.user.findMany({
            where: { role: 'INTERN' },
            select: { id: true, name: true, email: true },
            orderBy: { createdAt: 'desc' }, // Order by creation date
          }),

          // Get total pending verifications
          prisma.verification.count({
            where: { status: VERIFICATION_STATUS.PENDING },
          }),

          // Get last 7 days activity count
          prisma.logEntry.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),

          // Get all rotations with requirements
          prisma.rotation.findMany({
            where: { isActive: true },
            include: {
              requirements: {
                include: { procedure: true },
              },
            },
            orderBy: { name: 'asc' }, // Order by name for consistency
          }),
        ]);

      // Now get log entries for all interns
      const internIds = interns.map((intern) => intern.id);
      const allLogEntriesWithInterns = await prisma.logEntry.findMany({
        where: { internId: { in: internIds } },
        include: {
          procedure: { include: { rotation: true } },
          verification: true,
          intern: { select: { id: true } },
        },
      });

      // Calculate progress for each intern using the already loaded data
      const internSummaries: InternSummary[] = interns.map((intern) => {
        const internLogs =
          allLogEntriesWithInterns?.filter((log) => log.intern.id === intern.id) || [];

        // Calculate summary for this intern
        const summary = this.calculateInternSummaryFromLogs(internLogs, allRotations);

        return {
          id: intern.id,
          name: intern.name || 'Unknown',
          email: intern.email,
          totalVerified: summary.totalVerified,
          totalPending: summary.totalPending,
          completionPercentage: summary.completionPercentage,
        };
      });

      return {
        totalInterns: interns.length,
        totalPendingVerifications,
        last7DaysActivity,
        interns: internSummaries,
      };
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      throw new Error(
        `Failed to get dashboard overview: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Calculate intern summary from pre-loaded logs and rotations
   */
  private calculateInternSummaryFromLogs(
    logs: Array<{
      count: number;
      procedure: { rotationId: string };
      verification: { status: string } | null;
    }>,
    rotations: Array<{
      id: string;
      requirements: Array<{ minCount: number }>;
    }>,
  ): {
    totalVerified: number;
    totalPending: number;
    completionPercentage: number;
  } {
    const totalRequired = (rotations || []).reduce(
      (sum, rotation) =>
        sum + (rotation.requirements || []).reduce((reqSum, req) => reqSum + req.minCount, 0),
      0,
    );

    const verified = logs
      .filter((log) => log.verification?.status === VERIFICATION_STATUS.APPROVED)
      .reduce((sum, log) => sum + log.count, 0);

    const pending = logs
      .filter((log) => log.verification?.status === VERIFICATION_STATUS.PENDING)
      .reduce((sum, log) => sum + log.count, 0);

    return {
      totalVerified: verified,
      totalPending: pending,
      completionPercentage: calculateCompletionPercentage(verified, totalRequired),
    };
  }

  /**
   * Get pending verifications for a specific intern
   */
  private async getPendingVerifications(
    userId: string,
    limit: number = 5,
  ): Promise<PendingVerification[]> {
    try {
      const verifications = await prisma.verification.findMany({
        where: {
          status: 'PENDING',
          logEntry: { internId: userId },
        },
        include: {
          logEntry: {
            include: {
              procedure: true,
              intern: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return verifications.map((v) => ({
        id: v.id,
        logEntryId: v.logEntryId,
        procedureName: v.logEntry.procedure.name,
        internName: v.logEntry.intern.name || 'Unknown',
        date: v.logEntry.date,
        count: v.logEntry.count,
        notes: v.logEntry.notes ?? undefined,
        createdAt: v.timestamp || v.logEntry.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      return [];
    }
  }

  /**
   * Get recent activity for a specific intern
   */
  private async getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      // Get recent log entries
      const recentLogs = await prisma.logEntry.findMany({
        where: { internId: userId },
        include: {
          procedure: true,
          verification: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return recentLogs.map((log) => {
        let type: RecentActivity['type'];
        let description: string;

        if (!log.verification) {
          type = 'LOG_CREATED';
          description = `Logged ${log.count} ${log.procedure.name}`;
        } else if (log.verification.status === 'APPROVED') {
          type = 'LOG_VERIFIED';
          description = `${log.procedure.name} verified`;
        } else {
          type = 'LOG_REJECTED';
          description = `${log.procedure.name} rejected`;
        }

        return {
          id: log.id,
          type,
          description,
          timestamp: log.createdAt,
          internName: 'You', // For intern dashboard, it's always "You"
          procedureName: log.procedure.name,
        };
      });
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Export logs as CSV data
   */
  async exportLogs(params: ExportParams): Promise<LogExportRow[]> {
    const { userId, from, to } = params;

    const whereClause: {
      internId: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
    } = { internId: userId };

    if (from || to) {
      whereClause.date = {};
      if (from) whereClause.date.gte = from;
      if (to) whereClause.date.lte = to;
    }

    const logs = await prisma.logEntry.findMany({
      where: whereClause,
      include: {
        procedure: {
          include: {
            rotation: true,
          },
        },
        intern: true,
        verification: {
          include: {
            verifier: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      internName: log.intern.name || 'Unknown',
      procedureName: log.procedure.name,
      rotationName: log.procedure.rotation.name,
      date: formatDateForCSV(log.date),
      count: log.count,
      notes: log.notes ?? undefined,
      status: (log.verification?.status as VerificationStatus) || 'PENDING',
      verifiedBy: log.verification?.verifier?.name ?? undefined,
      verifiedAt: log.verification?.timestamp
        ? formatDateForCSV(log.verification.timestamp)
        : undefined,
      reason: log.verification?.reason ?? undefined,
    }));
  }

  /**
   * Generate CSV content from export data
   */
  generateCSVContent(rows: LogExportRow[]): string {
    if (rows.length === 0) {
      return 'No data available';
    }

    const headers = [
      'ID',
      'Intern Name',
      'Procedure Name',
      'Rotation Name',
      'Date',
      'Count',
      'Notes',
      'Status',
      'Verified By',
      'Verified At',
      'Reason',
    ];

    const csvRows = rows.map((row) => [
      row.id,
      row.internName,
      row.procedureName,
      row.rotationName,
      row.date,
      row.count.toString(),
      row.notes || '',
      row.status,
      row.verifiedBy || '',
      row.verifiedAt || '',
      row.reason || '',
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

// Export singleton instance
export const progressService = new ProgressService();
