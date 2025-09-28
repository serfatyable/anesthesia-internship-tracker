// Verification status type for SQLite (no enum support)
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Core progress tracking types
export interface ProgressSummary {
  totalRequired: number;
  totalVerified: number;
  totalPending: number;
  completionPercentage: number;
}

export interface RotationProgress {
  rotationId: string;
  rotationName: string;
  required: number;
  verified: number;
  pending: number;
  completionPercentage: number;
  state: string;
  currentInterns: number;
}

export interface PendingVerification {
  id: string;
  logEntryId: string;
  procedureName: string;
  internName: string;
  date: Date;
  count: number;
  notes?: string | undefined;
  createdAt: Date;
}

export interface RecentActivity {
  id: string;
  type: 'LOG_CREATED' | 'LOG_VERIFIED' | 'LOG_REJECTED';
  description: string;
  timestamp: Date;
  internName: string;
  procedureName?: string;
}

export interface InternSummary {
  id: string;
  name: string;
  email: string;
  totalVerified: number;
  totalPending: number;
  completionPercentage: number;
}

export interface DashboardOverview {
  totalInterns: number;
  totalPendingVerifications: number;
  last7DaysActivity: number;
  interns: InternSummary[];
}

export interface InternDashboard {
  summary: ProgressSummary;
  rotations: RotationProgress[];
  pendingVerifications: PendingVerification[];
  recentActivity: RecentActivity[];
  userInfo?:
    | {
        name: string | null;
        email: string;
        createdAt: Date;
      }
    | undefined;
}

// CSV export types
export interface LogExportRow {
  id: string;
  internName: string;
  procedureName: string;
  rotationName: string;
  date: string;
  count: number;
  notes?: string | undefined;
  status: VerificationStatus;
  verifiedBy?: string | undefined;
  verifiedAt?: string | undefined;
  reason?: string | undefined;
}

export interface ExportParams {
  userId: string;
  from?: Date | undefined;
  to?: Date | undefined;
}

// Progress calculation helpers
export function calculateCompletionPercentage(verified: number, required: number): number {
  if (required === 0) return 100;
  return Math.min(Math.round((verified / required) * 100), 100);
}

export function formatDateForDisplay(date: Date, timezone: string = 'Asia/Jerusalem'): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateForCSV(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''; // YYYY-MM-DD format
}
