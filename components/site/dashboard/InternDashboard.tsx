import { InternDashboard as InternDashboardType } from '@/lib/domain/progress';
import { ProgressBar } from './ProgressBar';
import { RotationCard } from './RotationCard';
import { PendingVerifications } from './PendingVerifications';
import { RecentActivity } from './RecentActivity';
import { ExportButton } from './ExportButton';
import { cn } from '@/lib/ui/cn';

interface InternDashboardProps {
  dashboard: InternDashboardType;
  userId: string;
  className?: string;
}

export function InternDashboard({ dashboard, userId, className }: InternDashboardProps) {
  const { summary, rotations, pendingVerifications, recentActivity } = dashboard;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Progress */}
      <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
        <ProgressBar
          value={summary.totalVerified}
          max={summary.totalRequired}
          label="Total Completion"
          className="mb-4"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {summary.totalRequired}
            </div>
            <div className="text-sm text-zinc-500">Required</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{summary.totalVerified}</div>
            <div className="text-sm text-zinc-500">Verified</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-600">{summary.totalPending}</div>
            <div className="text-sm text-zinc-500">Pending</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">{summary.totalOverAchieved}</div>
            <div className="text-sm text-zinc-500">Over-Achieved</div>
          </div>
        </div>

        {summary.totalOverAchieved > 0 && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Excellent work! You&apos;ve exceeded requirements by{' '}
                {summary.overAchievementPercentage}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton userId={userId} />
      </div>

      {/* Rotation Progress Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Rotation Progress</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rotations.map((rotation) => (
            <RotationCard key={rotation.rotationId} rotation={rotation} />
          ))}
        </div>
      </div>

      {/* Pending Verifications and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingVerifications verifications={pendingVerifications} />
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
}
