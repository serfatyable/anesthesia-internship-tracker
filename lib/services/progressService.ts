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
  ExportParams,
  calculateCompletionPercentage,
  calculateOverAchievement,
  calculateOverAchievementPercentage,
  formatDateForCSV,
} from '@/lib/domain/progress';

export class ProgressService {
  /**
   * Get progress data for a specific intern
   */
  async getInternProgress(userId: string): Promise<InternDashboard> {
    // Get all rotations with their requirements
    const rotations = await prisma.rotation.findMany({
      where: { isActive: true },
      include: {
        requirements: {
          include: {
            procedure: true,
          },
        },
      },
    });

    // Get all log entries for this intern with verification status
    const logEntries = await prisma.logEntry.findMany({
      where: { internId: userId },
      include: {
        procedure: {
          include: {
            rotation: true,
          },
        },
        verification: true,
      },
    });

    // Calculate progress per rotation
    const rotationProgress: RotationProgress[] = rotations.map((rotation) => {
      const requirements = rotation.requirements;
      const totalRequired = requirements.reduce((sum, req) => sum + req.minCount, 0);

      // Get logs for this rotation
      const rotationLogs = logEntries.filter((log) => log.procedure.rotationId === rotation.id);

      const verified = rotationLogs
        .filter((log) => log.verification?.status === 'APPROVED')
        .reduce((sum, log) => sum + log.count, 0);

      const pending = rotationLogs
        .filter((log) => log.verification?.status === 'PENDING')
        .reduce((sum, log) => sum + log.count, 0);

      const overAchieved = calculateOverAchievement(verified, totalRequired);

      return {
        rotationId: rotation.id,
        rotationName: rotation.name,
        required: totalRequired,
        verified,
        pending,
        overAchieved,
        completionPercentage: calculateCompletionPercentage(verified, totalRequired),
        overAchievementPercentage: calculateOverAchievementPercentage(verified, totalRequired),
      };
    });

    // Calculate overall summary
    const totalRequired = rotationProgress.reduce((sum, r) => sum + r.required, 0);
    const totalVerified = rotationProgress.reduce((sum, r) => sum + r.verified, 0);
    const totalPending = rotationProgress.reduce((sum, r) => sum + r.pending, 0);
    const totalOverAchieved = rotationProgress.reduce((sum, r) => sum + r.overAchieved, 0);

    const summary: ProgressSummary = {
      totalRequired,
      totalVerified,
      totalPending,
      totalOverAchieved,
      completionPercentage: calculateCompletionPercentage(totalVerified, totalRequired),
      overAchievementPercentage: calculateOverAchievementPercentage(totalVerified, totalRequired),
    };

    // Get pending verifications (latest 5)
    const pendingVerifications = await this.getPendingVerifications(userId, 5);

    // Get recent activity (latest 10)
    const recentActivity = await this.getRecentActivity(userId, 10);

    return {
      summary,
      rotations: rotationProgress,
      pendingVerifications,
      recentActivity,
    };
  }

  /**
   * Get dashboard overview for tutors/admins
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    // Get all interns
    const interns = await prisma.user.findMany({
      where: { role: 'INTERN' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Get total pending verifications
    const totalPendingVerifications = await prisma.verification.count({
      where: { status: 'PENDING' },
    });

    // Get last 7 days activity count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7DaysActivity = await prisma.logEntry.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get progress for each intern
    const internSummaries: InternSummary[] = await Promise.all(
      interns.map(async (intern) => {
        const progress = await this.getInternProgress(intern.id);
        return {
          id: intern.id,
          name: intern.name || 'Unknown',
          email: intern.email,
          totalVerified: progress.summary.totalVerified,
          totalPending: progress.summary.totalPending,
          totalOverAchieved: progress.summary.totalOverAchieved,
          completionPercentage: progress.summary.completionPercentage,
          overAchievementPercentage: progress.summary.overAchievementPercentage,
        };
      }),
    );

    return {
      totalInterns: interns.length,
      totalPendingVerifications,
      last7DaysActivity,
      interns: internSummaries,
    };
  }

  /**
   * Get pending verifications for a specific intern
   */
  private async getPendingVerifications(
    userId: string,
    limit: number = 5,
  ): Promise<PendingVerification[]> {
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
  }

  /**
   * Get recent activity for a specific intern
   */
  private async getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
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
      status: log.verification?.status || 'PENDING',
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
