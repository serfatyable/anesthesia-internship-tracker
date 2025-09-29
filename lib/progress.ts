// This file is deprecated. Use lib/services/progressService.ts instead.
// Keeping for backward compatibility during migration.

import { prisma } from '@/lib/db';
import {
  ProgressSummary as OldProgressSummary,
  RotationProgress as OldRotationProgress,
  PendingVerification,
  RecentActivity,
  InternSummary,
  DashboardOverview as OldDashboardOverview,
  InternDashboard as OldInternDashboard,
} from '@/lib/domain/progress';

// T9 Progress Dashboard Types
export interface RotationProgress {
  rotationId: string;
  rotationName: string;
  required: number; // sum of Requirement.minCount for that rotation
  logged: number; // sum of LogEntry.count for procedures in that rotation
  approved: number; // sum of LogEntry.count with Verification.status === 'APPROVED'
  pending: number; // count of Verification.status === 'PENDING' tied to those log entries
  completionPct: number; // approved/required, capped at 1; if required=0, set to 0 and flag 'noRequirement': true
  noRequirement?: boolean; // flag when required=0
  state: string; // ACTIVE, FINISHED, NOT_STARTED
}

export interface ProgressTotals {
  required: number;
  logged: number;
  approved: number;
  pending: number;
}

export interface InternProgress {
  totals: ProgressTotals;
  rotations: RotationProgress[];
}

export interface TutorProgress extends InternProgress {
  selectedInternId?: string;
  selectedInternName?: string;
}

/**
 * Get progress data for a specific intern
 * Returns overall totals and per-rotation breakdown
 */
export async function getInternProgress(userId: string): Promise<InternProgress> {
  // Get all rotations with their requirements
  const rotations = await prisma.rotation.findMany({
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

    const logged = rotationLogs.reduce((sum, log) => sum + log.count, 0);
    const approved = rotationLogs
      .filter((log) => log.verification?.status === 'APPROVED')
      .reduce((sum, log) => sum + log.count, 0);
    const pending = rotationLogs
      .filter((log) => log.verification?.status === 'PENDING')
      .reduce((sum, log) => sum + log.count, 0);

    // Calculate completion percentage
    let completionPct = 0;
    let noRequirement = false;

    if (totalRequired === 0) {
      completionPct = 0;
      noRequirement = true;
    } else {
      completionPct = Math.min(approved / totalRequired, 1);
    }

    // Determine state based on completion and database state
    let state = rotation.state;

    // Override state based on completion percentage
    if (completionPct >= 1.0) {
      state = 'FINISHED';
    } else if (completionPct > 0 && rotation.state === 'NOT_STARTED') {
      // If there's any completion but marked as NOT_STARTED, it should be ACTIVE
      state = 'ACTIVE';
    }

    return {
      rotationId: rotation.id,
      rotationName: rotation.name,
      required: totalRequired,
      logged,
      approved,
      pending,
      completionPct,
      noRequirement,
      state,
    };
  });

  // Calculate overall totals
  const totals: ProgressTotals = {
    required: rotationProgress.reduce((sum, r) => sum + r.required, 0),
    logged: rotationProgress.reduce((sum, r) => sum + r.logged, 0),
    approved: rotationProgress.reduce((sum, r) => sum + r.approved, 0),
    pending: rotationProgress.reduce((sum, r) => sum + r.pending, 0),
  };

  return {
    totals,
    rotations: rotationProgress,
  };
}

/**
 * Get progress data for tutors with optional intern selection
 * Same shape as getInternProgress, but for selected intern
 */
export async function getTutorProgress(internId?: string): Promise<TutorProgress> {
  // If no internId provided, get the first intern
  if (!internId) {
    const firstIntern = await prisma.user.findFirst({
      where: { role: 'INTERN' },
      orderBy: { createdAt: 'asc' },
    });

    if (!firstIntern) {
      throw new Error('No interns found');
    }
    internId = firstIntern.id;
  }

  // Verify the intern exists
  const intern = await prisma.user.findUnique({
    where: { id: internId, role: 'INTERN' },
  });

  if (!intern) {
    throw new Error('Intern not found');
  }

  // Get progress for the selected intern
  const progress = await getInternProgress(internId);

  return {
    ...progress,
    selectedInternId: internId,
    selectedInternName: intern.name || 'Unknown',
  };
}

/**
 * Get list of all interns for tutor selector
 */
export async function getInternsList() {
  const interns = await prisma.user.findMany({
    where: { role: 'INTERN' },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  });

  return interns;
}

/**
 * Get pending verifications for a specific intern
 */
async function getPendingVerifications(
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
async function getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
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
      internName: 'You',
      procedureName: log.procedure.name,
    };
  });
}

/**
 * Get intern progress in the old format for the polished dashboard
 */
export async function getInternProgressOld(userId: string): Promise<OldInternDashboard> {
  const progress = await getInternProgress(userId);
  const pendingVerifications = await getPendingVerifications(userId, 5);
  const recentActivity = await getRecentActivity(userId, 10);

  // Convert to old format
  const summary: OldProgressSummary = {
    totalRequired: progress.totals.required,
    totalVerified: progress.totals.approved,
    totalPending: progress.totals.pending,
    completionPercentage:
      progress.totals.required > 0
        ? Math.min(Math.round((progress.totals.approved / progress.totals.required) * 100), 100)
        : 0,
  };

  const rotations: OldRotationProgress[] = progress.rotations.map((r) => {
    const completionPercentage =
      r.required > 0 ? Math.min(Math.round((r.approved / r.required) * 100), 100) : 0;

    // Determine state based on completion percentage
    let state = r.state;
    if (completionPercentage >= 100) {
      state = 'FINISHED';
    } else if (completionPercentage > 0 && r.state === 'NOT_STARTED') {
      state = 'ACTIVE';
    }

    return {
      rotationId: r.rotationId,
      rotationName: r.rotationName,
      required: r.required,
      verified: r.approved,
      pending: r.pending,
      completionPercentage,
      state,
      currentInterns: (r as any).currentInterns || 0,
    };
  });

  return {
    summary,
    rotations,
    pendingVerifications,
    recentActivity,
  };
}

/**
 * Get tutor progress in the old format for the polished dashboard
 */
export async function getTutorProgressOld(
  internId?: string,
): Promise<OldInternDashboard & { selectedInternId?: string; selectedInternName?: string }> {
  const progress = await getTutorProgress(internId);
  const oldProgress = await getInternProgressOld(progress.selectedInternId!);

  const result: OldInternDashboard & { selectedInternId?: string; selectedInternName?: string } = {
    ...oldProgress,
  };

  if (progress.selectedInternId) {
    result.selectedInternId = progress.selectedInternId;
  }

  if (progress.selectedInternName) {
    result.selectedInternName = progress.selectedInternName;
  }

  return result;
}

/**
 * Get dashboard overview in the old format
 */
export async function getDashboardOverviewOld(): Promise<OldDashboardOverview> {
  const interns = await getInternsList();

  const totalPendingVerifications = await prisma.verification.count({
    where: { status: 'PENDING' },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const last7DaysActivity = await prisma.logEntry.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  const internSummaries: InternSummary[] = await Promise.all(
    interns.map(async (intern) => {
      const progress = await getInternProgress(intern.id);
      return {
        id: intern.id,
        name: intern.name || 'Unknown',
        email: intern.email,
        totalVerified: progress.totals.approved,
        totalPending: progress.totals.pending,
        completionPercentage:
          progress.totals.required > 0
            ? Math.min(Math.round((progress.totals.approved / progress.totals.required) * 100), 100)
            : 0,
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
