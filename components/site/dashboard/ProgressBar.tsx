import { cn } from '@/lib/ui/cn';
import { memo } from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressBar = memo(function ProgressBar({
  value,
  max,
  label,
  className,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage =
    max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className='flex justify-between text-sm'>
          <span className='font-medium'>{label}</span>
          {showPercentage && (
            <span className='text-gray-600'>{percentage}%</span>
          )}
        </div>
      )}
      <div className='w-full bg-gray-200 rounded-full h-2.5'>
        <div
          className='bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out'
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className='flex justify-between text-xs text-gray-500'>
        <span>{value} completed</span>
        <span>{max} required</span>
      </div>
    </div>
  );
});
