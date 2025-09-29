'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { cn } from '@/lib/ui/cn';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface FeedbackItem {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface MentorGroup {
  mentor: {
    id: string;
    name: string;
    email: string;
  };
  feedback: FeedbackItem[];
}

interface FeedbackData {
  itemId: string;
  itemType: string;
  feedback: MentorGroup[];
  totalCount: number;
  unreadCount: number;
}

interface FeedbackModalProps {
  isOpen: boolean;
  itemId: string;
  itemType: string;
  onClose: () => void;
}

export const FeedbackModal = memo(function FeedbackModal({
  isOpen,
  itemId,
  itemType,
  onClose,
}: FeedbackModalProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedMentors, setExpandedMentors] = useState<Set<string>>(
    new Set()
  );

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/mentor-feedback?itemId=${itemId}&itemType=${itemType}`
      );
      if (response.ok) {
        const data = await response.json();
        setFeedbackData(data);
        // Auto-expand mentors with unread feedback
        const mentorsWithUnread = data.feedback
          .filter((group: MentorGroup) =>
            group.feedback.some((f: FeedbackItem) => !f.isRead)
          )
          .map((group: MentorGroup) => group.mentor.id);
        setExpandedMentors(new Set(mentorsWithUnread));
      } else {
        console.error('Error loading feedback:', response.status);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [itemId, itemType]);

  useEffect(() => {
    if (isOpen && itemId && itemType) {
      loadFeedback();
    }
  }, [isOpen, itemId, itemType, loadFeedback]);

  const markAsRead = useCallback(async (feedbackId: string) => {
    try {
      const response = await fetch('/api/mentor-feedback', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackId }),
      });
      if (response.ok) {
        // Update local state
        setFeedbackData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            feedback: prev.feedback.map(group => ({
              ...group,
              feedback: group.feedback.map(item =>
                item.id === feedbackId ? { ...item, isRead: true } : item
              ),
            })),
            unreadCount: Math.max(0, prev.unreadCount - 1),
          };
        });
      }
    } catch (error) {
      console.error('Error marking feedback as read:', error);
    }
  }, []);

  const toggleMentorExpansion = useCallback((mentorId: string) => {
    setExpandedMentors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mentorId)) {
        newSet.delete(mentorId);
      } else {
        newSet.add(mentorId);
      }
      return newSet;
    });
  }, []);

  const handleFeedbackClick = useCallback(
    (feedback: FeedbackItem) => {
      if (!feedback.isRead) {
        markAsRead(feedback.id);
      }
    },
    [markAsRead]
  );

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[80vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Mentor Feedback
            </h2>
            <p className='text-sm text-gray-600'>
              {itemType === 'PROCEDURE' ? 'Procedure' : 'Knowledge'}: {itemId}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <svg
              className='w-5 h-5 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <LoadingSpinner size='lg' text='Loading feedback...' />
          ) : feedbackData && feedbackData.feedback.length > 0 ? (
            <div className='space-y-4'>
              {/* Summary */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='text-sm text-gray-600'>
                      <span className='font-medium'>
                        {feedbackData.totalCount}
                      </span>{' '}
                      total feedback
                    </div>
                    {feedbackData.unreadCount > 0 && (
                      <div className='flex items-center gap-1'>
                        <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                        <span className='text-sm text-red-600 font-medium'>
                          {feedbackData.unreadCount} unread
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback Groups */}
              {feedbackData.feedback.map(group => (
                <div
                  key={group.mentor.id}
                  className='border border-gray-200 rounded-lg'
                >
                  {/* Mentor Header */}
                  <button
                    onClick={() => toggleMentorExpansion(group.mentor.id)}
                    className='w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-blue-600 font-medium text-sm'>
                          {group.mentor.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div className='text-left'>
                        <h3 className='font-medium text-gray-900'>
                          {group.mentor.name}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {group.mentor.email}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {group.feedback.some(f => !f.isRead) && (
                        <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                      )}
                      <span className='text-sm text-gray-500'>
                        {group.feedback.length} feedback
                      </span>
                      <svg
                        className={cn(
                          'w-4 h-4 text-gray-400 transition-transform',
                          expandedMentors.has(group.mentor.id) && 'rotate-180'
                        )}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Feedback Items */}
                  {expandedMentors.has(group.mentor.id) && (
                    <div className='border-t border-gray-200'>
                      {group.feedback.map(feedback => (
                        <div
                          key={feedback.id}
                          className={cn(
                            'p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors',
                            !feedback.isRead && 'bg-blue-50 hover:bg-blue-100',
                            feedback.isRead && 'hover:bg-gray-50'
                          )}
                          onClick={() => handleFeedbackClick(feedback)}
                        >
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <p className='text-gray-900'>
                                {feedback.content}
                              </p>
                              <div className='flex items-center gap-2 mt-2'>
                                <span className='text-xs text-gray-500'>
                                  {new Date(
                                    feedback.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                {!feedback.isRead && (
                                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <svg
                className='w-12 h-12 text-gray-400 mx-auto mb-4'
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
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No Feedback Yet
              </h3>
              <p className='text-gray-600'>
                Your mentors haven&apos;t provided feedback for this item yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end pt-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});
