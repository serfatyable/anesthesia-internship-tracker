import { RecentActivity as RecentActivityType } from '@/lib/domain/progress';
import { formatDateForDisplay } from '@/lib/domain/progress';
import { cn } from '@/lib/ui/cn';

interface RecentActivityProps {
  activities: RecentActivityType[];
  className?: string;
}

const activityIcons = {
  LOG_CREATED: '📝',
  LOG_VERIFIED: '✅',
  LOG_REJECTED: '❌',
};

const activityColors = {
  LOG_CREATED: 'text-blue-600 dark:text-blue-400',
  LOG_VERIFIED: 'text-green-600 dark:text-green-400',
  LOG_REJECTED: 'text-red-600 dark:text-red-400',
};

export function RecentActivity({ activities, className }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div
        className={cn('rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6', className)}
      >
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <p className="text-zinc-500 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6', className)}
    >
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0 text-lg">{activityIcons[activity.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('font-medium text-sm', activityColors[activity.type])}>
                  {activity.description}
                </span>
                {activity.procedureName && (
                  <span className="text-xs text-zinc-500">• {activity.procedureName}</span>
                )}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {formatDateForDisplay(activity.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
