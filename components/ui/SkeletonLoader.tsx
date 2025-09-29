'use client';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
}

export default function SkeletonLoader({
  className = '',
  lines = 1,
  height = 'h-4',
}: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 rounded ${height} ${
            i < lines - 1 ? 'mb-2' : ''
          }`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6 animate-pulse'>
      <div className='flex items-center space-x-4 mb-4'>
        <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
        <div className='flex-1'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-3 bg-gray-200 rounded w-1/2'></div>
        </div>
      </div>
      <div className='space-y-2'>
        <div className='h-3 bg-gray-200 rounded'></div>
        <div className='h-3 bg-gray-200 rounded w-5/6'></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='animate-pulse'>
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='h-4 bg-gray-200 rounded w-1/4'></div>
        </div>
        <div className='divide-y divide-gray-200'>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className='px-6 py-4'>
              <div className='flex items-center space-x-4'>
                <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-1/3'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/4'></div>
                </div>
                <div className='h-6 bg-gray-200 rounded w-16'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
