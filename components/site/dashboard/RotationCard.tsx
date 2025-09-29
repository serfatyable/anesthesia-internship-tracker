import { RotationProgress as OldRotationProgress } from '@/lib/domain/progress';
import Link from 'next/link';
import { memo } from 'react';

interface RotationCardProps {
  rotation: OldRotationProgress;
  className?: string;
}

export const RotationCard = memo(function RotationCard({
  rotation,
  className = '',
}: RotationCardProps) {
  const {
    rotationName,
    required,
    verified,
    pending,
    completionPercentage,
    state,
  } = rotation;

  // Calculate progress bar width (0-100%)
  const progressWidth = completionPercentage;

  // Determine progress bar color based on state and completion
  const getProgressColor = () => {
    if (state === 'NOT_STARTED') return 'bg-gray-300';
    if (state === 'FINISHED') return 'bg-blue-500';
    if (state === 'ACTIVE') {
      if (required === 0) return 'bg-gray-300';
      if (completionPercentage >= 100) return 'bg-green-500';
      if (completionPercentage >= 70) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    return 'bg-gray-300';
  };

  // Determine card border color based on state
  const getCardBorderColor = () => {
    if (state === 'ACTIVE') return 'border-blue-500 border-2';
    if (state === 'FINISHED') return 'border-green-500 border-2';
    return 'border-gray-200';
  };

  // Get unique background color for each rotation
  const getRotationBackgroundColor = () => {
    const rotationColors: { [key: string]: string } = {
      ICU: 'bg-blue-50',
      PACU: 'bg-purple-50',
      OR: 'bg-green-50',
      OB: 'bg-pink-50',
      Pain: 'bg-orange-50',
      Pediatric: 'bg-yellow-50',
      Cardiac: 'bg-red-50',
      Neuro: 'bg-indigo-50',
      Regional: 'bg-teal-50',
      Emergency: 'bg-amber-50',
    };
    return rotationColors[rotationName] || 'bg-gray-50';
  };

  // Get unique border color for each rotation (for hover effect)
  const getRotationBorderColor = () => {
    const borderColors: { [key: string]: string } = {
      ICU: 'border-blue-400',
      PACU: 'border-purple-400',
      OR: 'border-green-400',
      OB: 'border-pink-400',
      Pain: 'border-orange-400',
      Pediatric: 'border-yellow-400',
      Cardiac: 'border-red-400',
      Neuro: 'border-indigo-400',
      Regional: 'border-teal-400',
      Emergency: 'border-amber-400',
    };
    return borderColors[rotationName] || 'border-gray-400';
  };

  // Use the actual intern count from the rotation data
  const internCount = rotation.currentInterns || 0;

  return (
    <Link href={`/rotations/${encodeURIComponent(rotationName)}`}>
      <div
        className={`${getRotationBackgroundColor()} rounded-lg ${getCardBorderColor()} p-4 sm:p-6 ${className} transition-all duration-300 hover:shadow-lg hover:${getRotationBorderColor()} hover:border-2 hover:scale-105 cursor-pointer`}
      >
        {/* Rotation Name */}
        <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4'>
          {rotationName}
        </h3>

        {/* Progress Bar with Percentage */}
        <div className='mb-3 sm:mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs sm:text-sm text-gray-600'>Progress</span>
            <span className='text-xs sm:text-sm font-semibold text-gray-900'>
              {required === 0 ? 'N/A' : `${progressWidth}%`}
            </span>
          </div>
          <div className='relative w-full bg-gray-200 rounded-full h-2 sm:h-3'>
            <div
              className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progressWidth}%` }}
              role='progressbar'
              aria-valuenow={progressWidth}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${rotationName} progress: ${progressWidth}%`}
            />
          </div>
        </div>

        {/* Details Grid - Responsive Layout */}
        <div className='space-y-2 text-xs sm:text-sm'>
          {/* Mobile: 2x2 grid, Desktop: single column */}
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-0 sm:space-y-2'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Procedures:</span>
              <span className='font-medium text-gray-900'>
                {verified} / {required}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Knowledge:</span>
              <span className='font-medium text-gray-900'>
                {verified} / {required}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Pending:</span>
              <span className='font-medium text-yellow-600'>{pending}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Interns:</span>
              <span className='font-medium text-blue-600'>{internCount}</span>
            </div>
          </div>
        </div>

        {/* No Requirements Notice */}
        {required === 0 && (
          <div className='mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-md'>
            <p className='text-xs sm:text-sm text-gray-600'>
              No specific requirements defined for this rotation.
            </p>
          </div>
        )}
      </div>
    </Link>
  );
});
