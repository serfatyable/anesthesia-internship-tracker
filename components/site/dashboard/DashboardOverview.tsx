import { DashboardOverview as DashboardOverviewType } from '@/lib/domain/progress';
import { InternsTable } from './InternsTable';
import { cn } from '@/lib/ui/cn';

interface DashboardOverviewProps {
  overview: DashboardOverviewType;
  className?: string;
}

export function DashboardOverview({ overview, className }: DashboardOverviewProps) {
  const { totalInterns, totalPendingVerifications, last7DaysActivity, interns } = overview;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Interns</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalInterns}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Pending Verifications
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalPendingVerifications}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Last 7 Days Activity
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {last7DaysActivity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interns Table */}
      <InternsTable interns={interns} />
    </div>
  );
}
