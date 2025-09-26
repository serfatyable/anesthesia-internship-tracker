import { RotationProgress } from '@/lib/domain/progress';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/ui/cn';

interface RotationCardProps {
  rotation: RotationProgress;
  className?: string;
}

export function RotationCard({ rotation, className }: RotationCardProps) {
  const {
    rotationName,
    required,
    verified,
    pending,
    overAchieved,
    completionPercentage,
    overAchievementPercentage,
  } = rotation;

  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6 shadow-sm',
        className,
      )}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{rotationName}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {completionPercentage}% complete
          </p>
        </div>

        <ProgressBar value={verified} max={required} showPercentage={false} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{required}</div>
            <div className="text-xs text-zinc-500">Required</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{verified}</div>
            <div className="text-xs text-zinc-500">Verified</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{pending}</div>
            <div className="text-xs text-zinc-500">Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{overAchieved}</div>
            <div className="text-xs text-zinc-500">Over-Achieved</div>
          </div>
        </div>

        {overAchieved > 0 && (
          <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center space-x-1">
              <svg
                className="w-4 h-4 text-purple-600"
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
              <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                +{overAchievementPercentage}% over target
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
