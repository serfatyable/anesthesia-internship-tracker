import { InternDashboard as InternDashboardType } from '@/lib/domain/progress';
import { OverallProgressCard } from './OverallProgressCard';
import { RotationGroups } from './RotationGroups';
import { cn } from '@/lib/ui/cn';

interface InternDashboardProps {
  dashboard: InternDashboardType;
  className?: string;
}

export function InternDashboard({ dashboard, className }: InternDashboardProps) {
  const { summary, rotations } = dashboard;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Progress Card */}
      <OverallProgressCard summary={summary} rotations={rotations} />

      {/* Rotation Progress Cards */}
      <div className="flex justify-center">
        <div className="w-full max-w-7xl">
          <RotationGroups rotations={rotations} />
        </div>
      </div>
    </div>
  );
}
