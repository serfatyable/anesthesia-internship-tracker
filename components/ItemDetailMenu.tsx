'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/ui/cn';

interface ItemDetailMenuProps {
  onQuizClick: () => void;
  onReflectionClick: () => void;
  quizStatus?: 'passed' | 'failed' | 'not-attempted';
  reflectionStatus?: 'submitted' | 'not-submitted';
  className?: string;
}

export function ItemDetailMenu({
  onQuizClick,
  onReflectionClick,
  quizStatus = 'not-attempted',
  reflectionStatus = 'not-submitted',
  className = '',
}: ItemDetailMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getQuizIconColor = () => {
    switch (quizStatus) {
      case 'passed':
        return 'text-green-600 hover:text-green-700';
      case 'failed':
        return 'text-red-600 hover:text-red-700';
      default:
        return 'text-gray-600 hover:text-gray-700';
    }
  };

  const getReflectionIconColor = () => {
    switch (reflectionStatus) {
      case 'submitted':
        return 'text-orange-600 hover:text-orange-700';
      default:
        return 'text-gray-600 hover:text-gray-700';
    }
  };

  const getQuizTooltip = () => {
    switch (quizStatus) {
      case 'passed':
        return 'Quiz passed - Click to retake';
      case 'failed':
        return 'Quiz failed - Click to retake';
      default:
        return 'Take quiz';
    }
  };

  const getReflectionTooltip = () => {
    switch (reflectionStatus) {
      case 'submitted':
        return 'Reflection submitted - Click to edit';
      default:
        return 'Write reflection';
    }
  };

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open item details"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
          {/* Quiz Option */}
          <button
            onClick={() => {
              onQuizClick();
              setIsOpen(false);
            }}
            className={cn(
              'w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3',
              getQuizIconColor(),
            )}
            title={getQuizTooltip()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">
              {quizStatus === 'passed'
                ? 'Quiz (Passed)'
                : quizStatus === 'failed'
                  ? 'Quiz (Failed)'
                  : 'Take Quiz'}
            </span>
          </button>

          {/* Reflection Option */}
          <button
            onClick={() => {
              onReflectionClick();
              setIsOpen(false);
            }}
            className={cn(
              'w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3',
              getReflectionIconColor(),
            )}
            title={getReflectionTooltip()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="text-sm font-medium">
              {reflectionStatus === 'submitted' ? 'Reflection (Submitted)' : 'Write Reflection'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
