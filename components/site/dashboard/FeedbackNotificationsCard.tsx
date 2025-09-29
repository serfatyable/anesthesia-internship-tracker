'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/ui/cn';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface FeedbackNotificationsCardProps {
  className?: string;
}

interface NotificationData {
  totalUnreadCount: number;
  itemNotifications: Array<{
    itemId: string;
    itemType: string;
    unreadCount: number;
  }>;
}

export const FeedbackNotificationsCard = memo(
  function FeedbackNotificationsCard({
    className,
  }: FeedbackNotificationsCardProps) {
    const [notifications, setNotifications] = useState<NotificationData | null>(
      null
    );
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const response = await fetch('/api/mentor-feedback/notifications');
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
          } else if (response.status === 401) {
            setNotifications({ totalUnreadCount: 0, itemNotifications: [] });
          } else {
            console.error(
              'Error fetching feedback notifications:',
              response.status
            );
          }
        } catch (error) {
          console.error('Error fetching feedback notifications:', error);
          setNotifications({ totalUnreadCount: 0, itemNotifications: [] });
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }, []);

    const handleCardClick = useCallback(() => {
      // Navigate to a page that shows all feedback notifications
      // For now, we'll navigate to the dashboard where users can see the notifications on individual items
      router.push('/dashboard');
    }, [router]);

    if (loading) {
      return (
        <div
          className={cn(
            'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 h-full',
            className
          )}
        >
          <LoadingSpinner size='md' text='Loading feedback...' />
        </div>
      );
    }

    const unreadCount = notifications?.totalUnreadCount || 0;

    return (
      <div
        className={cn(
          'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group',
          className
        )}
        onClick={handleCardClick}
      >
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors'>
                <svg
                  className='w-5 h-5 text-orange-600'
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
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <div className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors'>
                Mentor Feedback
              </h3>
              <p className='text-sm text-gray-600'>
                {unreadCount > 0
                  ? `${unreadCount} new feedback`
                  : 'No new feedback'}
              </p>
            </div>
          </div>
          <svg
            className='w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors'
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

        {unreadCount > 0 ? (
          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>
              You have new feedback from your mentors on completed tasks.
            </p>
            <div className='flex items-center gap-2 text-sm text-orange-600'>
              <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
              <span className='font-medium'>Click to view feedback</span>
            </div>
          </div>
        ) : (
          <div className='text-sm text-gray-600'>
            <p>• Complete tasks to receive feedback</p>
            <p>• Mentors will review your work</p>
            <p>• Get personalized guidance</p>
          </div>
        )}
      </div>
    );
  }
);
