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
  LOG_CREATED: 'text-blue-600',
  LOG_VERIFIED: 'text-green-600',
  LOG_REJECTED: 'text-red-600',
};

export function RecentActivity({ activities, className }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-gray-200 p-6 bg-white', className)}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
        <p className="text-gray-500 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-gray-200 p-6 bg-white', className)}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0 text-lg">{activityIcons[activity.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('font-medium text-sm', activityColors[activity.type])}>
                  {activity.description}
                </span>
                {activity.procedureName && (
                  <span className="text-xs text-gray-500">• {activity.procedureName}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDateForDisplay(activity.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
