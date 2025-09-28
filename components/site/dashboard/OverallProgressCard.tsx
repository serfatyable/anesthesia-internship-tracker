import { ProgressSummary, RotationProgress } from '@/lib/domain/progress';
import { cn } from '@/lib/ui/cn';
import { memo } from 'react';

interface OverallProgressCardProps {
  summary: ProgressSummary;
  rotations: RotationProgress[];
  userInfo?:
    | {
        name: string | null;
        email: string;
        createdAt: Date;
      }
    | undefined;
  className?: string;
}

export const OverallProgressCard = memo(function OverallProgressCard({
  summary,
  rotations,
  userInfo,
  className,
}: OverallProgressCardProps) {
  // Calculate completed rotations (rotations with 100% completion)
  const completedRotations = rotations.filter(
    (rotation) => rotation.completionPercentage >= 100,
  ).length;
  const totalRotations = rotations.length;

  // Calculate overall internship progress
  const overallProgress = summary.completionPercentage;

  // Calculate internship duration
  const calculateInternshipDuration = (startDate: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - startDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 30) {
      return `${diffInDays} days`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      const remainingDays = diffInDays % 30;
      return remainingDays > 0 ? `${months} months, ${remainingDays} days` : `${months} months`;
    } else {
      const years = Math.floor(diffInDays / 365);
      const remainingDays = diffInDays % 365;
      const months = Math.floor(remainingDays / 30);
      if (months > 0) {
        return `${years} years, ${months} months`;
      }
      return `${years} years`;
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50',
        className,
      )}
    >
      {/* Overall Progress Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Internship Progress</h2>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-gray-900">{overallProgress}%</div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Completed Rotations</div>
            <div className="text-lg font-semibold text-gray-900">
              {completedRotations} / {totalRotations}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
            role="progressbar"
            aria-valuenow={overallProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Overall internship progress: ${overallProgress}%`}
          />
        </div>
      </div>

      {/* Internship Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Completed Rotations */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {completedRotations} / {totalRotations}
            </div>
            <div className="text-sm text-gray-600 mb-1">Completed Rotations</div>
            <div className="text-xs text-gray-500">Out of total rotations</div>
          </div>

          {/* Pending for Approval */}
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{summary.totalPending}</div>
            <div className="text-sm text-gray-600 mb-1">Pending for Approval</div>
            <div className="text-xs text-gray-500">Awaiting verification</div>
          </div>

          {/* Time in Internship */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {userInfo ? calculateInternshipDuration(userInfo.createdAt) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600 mb-1">Time in Internship</div>
            <div className="text-xs text-gray-500">Since start date</div>
          </div>
        </div>
      </div>

      {/* All Rotations Complete Message */}
      {completedRotations === totalRotations && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-green-800 font-semibold text-lg mb-1">🎉 Congratulations!</div>
          <div className="text-green-700">
            You have completed all rotations in your internship program.
          </div>
        </div>
      )}
    </div>
  );
});
