import { ProgressSummary, RotationProgress } from '@/lib/domain/progress';
import { cn } from '@/lib/ui/cn';

interface OverallProgressCardProps {
  summary: ProgressSummary;
  rotations: RotationProgress[];
  className?: string;
}

export function OverallProgressCard({ summary, rotations, className }: OverallProgressCardProps) {
  // Calculate completed rotations (rotations with 100% completion)
  const completedRotations = rotations.filter(
    (rotation) => rotation.completionPercentage >= 100,
  ).length;
  const totalRotations = rotations.length;

  // Find current rotation (prioritize ACTIVE state, then first incomplete rotation)
  const currentRotation =
    rotations.find((rotation) => rotation.state === 'ACTIVE') ||
    rotations.find((rotation) => rotation.completionPercentage < 100);

  // Calculate overall internship progress
  const overallProgress = summary.completionPercentage;

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

      {/* Current Rotation Card */}
      {currentRotation && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="mb-4">
            <div className="text-2xl font-bold text-gray-900 mb-3">
              {currentRotation.rotationName}{' '}
              <span className="text-lg font-normal text-gray-600">(Current Rotation)</span>
            </div>

            {/* Procedures and Knowledge Details */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Procedures</div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentRotation.verified} / {currentRotation.required}
                </div>
                <div className="text-xs text-gray-500">
                  {currentRotation.pending > 0 && `${currentRotation.pending} pending`}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">Knowledge</div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentRotation.verified} / {currentRotation.required}
                </div>
                <div className="text-xs text-gray-500">
                  {currentRotation.pending > 0 && `${currentRotation.pending} pending`}
                </div>
              </div>
            </div>
          </div>

          {/* Current Rotation Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-8">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-8 rounded-full transition-all duration-300 ease-out flex items-center justify-center"
              style={{ width: `${currentRotation.completionPercentage}%` }}
              role="progressbar"
              aria-valuenow={currentRotation.completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${currentRotation.rotationName} progress: ${currentRotation.completionPercentage}%`}
            >
              <span className="text-white text-sm font-semibold">
                {currentRotation.completionPercentage}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* All Rotations Complete Message */}
      {!currentRotation && completedRotations === totalRotations && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-green-800 font-semibold text-lg mb-1">🎉 Congratulations!</div>
          <div className="text-green-700">
            You have completed all rotations in your internship program.
          </div>
        </div>
      )}
    </div>
  );
}
