import { InternDashboard as InternDashboardType } from '@/lib/domain/progress';
import { OverallProgressCard } from './OverallProgressCard';
import { RotationGroups } from './RotationGroups';
import { CaseReviewCard } from './CaseReviewCard';
import { ProcedureKnowledgeFavoritesCard } from './ProcedureKnowledgeFavoritesCard';
import { FeedbackNotificationsCard } from './FeedbackNotificationsCard';
import { ResourcesCard } from './ResourcesCard';
import { cn } from '@/lib/ui/cn';
import { memo } from 'react';

interface InternDashboardProps {
  dashboard: InternDashboardType;
  className?: string;
}

export const InternDashboard = memo(function InternDashboard({
  dashboard,
  className,
}: InternDashboardProps) {
  const { summary, rotations, userInfo } = dashboard;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Progress Card */}
      <OverallProgressCard summary={summary} rotations={rotations} userInfo={userInfo} />

      {/* Rotation Progress Cards */}
      <div className="flex justify-center">
        <div className="w-full max-w-7xl">
          <RotationGroups rotations={rotations} />
        </div>
      </div>

      {/* Case Review, Favorites, Feedback, and Resources Cards - 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <CaseReviewCard />
        <ProcedureKnowledgeFavoritesCard />
        <FeedbackNotificationsCard />
        <ResourcesCard
          {...(process.env.NEXT_PUBLIC_GOOGLE_DRIVE_URL && {
            driveUrl: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_URL,
          })}
        />
      </div>
    </div>
  );
});
