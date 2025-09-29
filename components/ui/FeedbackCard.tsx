'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/ui/cn';

interface FeedbackCardProps {
  itemId: string;
  itemType: 'PROCEDURE' | 'KNOWLEDGE';
  onFeedbackClick: (itemId: string, itemType: string) => void;
  unreadCount?: number;
  hasFeedback?: boolean;
  disabled?: boolean;
}

export const FeedbackCard = memo(function FeedbackCard({
  itemId,
  itemType,
  onFeedbackClick,
  unreadCount = 0,
  hasFeedback = false,
  disabled = false,
}: FeedbackCardProps) {
  // const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (!disabled) {
      onFeedbackClick(itemId, itemType);
    }
  }, [disabled, onFeedbackClick, itemId, itemType]);

  const getCardStyles = () => {
    if (disabled) {
      return 'bg-gray-100 border-gray-200 cursor-not-allowed';
    }
    if (unreadCount > 0) {
      return 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300';
    }
    if (hasFeedback) {
      return 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300';
    }
    return 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
  };

  const getIconColor = () => {
    if (disabled) {
      return 'text-gray-400';
    }
    if (unreadCount > 0) {
      return 'text-orange-600';
    }
    if (hasFeedback) {
      return 'text-green-600';
    }
    return 'text-gray-500';
  };

  return (
    <div
      className={cn(
        'relative p-3 rounded-lg border transition-all duration-200 cursor-pointer',
        getCardStyles()
      )}
      onClick={handleClick}
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
    >
      {/* Notification Badge */}
      {unreadCount > 0 && (
        <div className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}

      <div className='flex items-center gap-3'>
        <div
          className={cn(
            'p-2 rounded-lg',
            disabled ? 'bg-gray-100' : 'bg-white'
          )}
        >
          <svg
            className={cn('w-5 h-5 transition-colors', getIconColor())}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
            />
          </svg>
        </div>

        <div className='flex-1'>
          <h4 className='font-medium text-gray-900 text-sm'>Mentor Feedback</h4>
          <p className='text-xs text-gray-600'>
            {disabled
              ? 'Complete task first'
              : unreadCount > 0
                ? `${unreadCount} new feedback`
                : hasFeedback
                  ? 'View feedback'
                  : 'No feedback yet'}
          </p>
        </div>

        <svg
          className={cn(
            'w-4 h-4 transition-colors',
            disabled
              ? 'text-gray-400'
              : 'text-gray-500 group-hover:text-gray-700'
          )}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5l7 7-7 7'
          />
        </svg>
      </div>
    </div>
  );
});
