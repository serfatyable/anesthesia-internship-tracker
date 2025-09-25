import { RotationProgress } from '@/lib/domain/progress';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/ui/cn';

interface RotationCardProps {
  rotation: RotationProgress;
  className?: string;
}

export function RotationCard({ rotation, className }: RotationCardProps) {
  const { rotationName, required, verified, pending, completionPercentage } = rotation;

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

        <div className="grid grid-cols-3 gap-4 text-center">
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
        </div>
      </div>
    </div>
  );
}
