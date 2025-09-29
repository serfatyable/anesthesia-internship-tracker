'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/ui/cn';

interface CaseReviewCardProps {
  className?: string;
}

export function CaseReviewCard({ className }: CaseReviewCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/case-review');
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group h-64 flex flex-col',
        className
      )}
      onClick={handleClick}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors'>
            <svg
              className='w-6 h-6 text-purple-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors'>
              Case Review
            </h3>
            <p className='text-sm text-gray-600'>
              Share and explore interesting cases
            </p>
          </div>
        </div>
        <svg
          className='w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors'
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

      <div className='flex-1 text-sm text-gray-600'>
        <p>• View cases from colleagues</p>
        <p>• Share your own experiences</p>
        <p>• Learn from real scenarios</p>
      </div>
    </div>
  );
}
