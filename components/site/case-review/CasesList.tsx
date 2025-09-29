'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Define the interface locally to avoid circular imports
interface Case {
  id: string;
  title: string;
  description: string;
  category: string;
  image1Url?: string | null;
  image2Url?: string | null;
  image3Url?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    comments: number;
    favorites: number;
  };
  favorites: Array<{
    id: string;
  }>;
}

interface CasesListProps {
  cases: Case[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onFavoriteToggle: (caseId: string, favorited: boolean) => void;
}

export function CasesList({
  cases,
  loading,
  hasMore,
  onLoadMore,
  onFavoriteToggle,
}: CasesListProps) {
  const router = useRouter();
  const observerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const handleCaseClick = (caseId: string) => {
    router.push(`/case-review/${caseId}`);
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/cases/${caseId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to toggle favorite');

      const data = await response.json();
      onFavoriteToggle(caseId, data.favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (cases.length === 0 && !loading) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 p-8 text-center'>
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
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No cases found
        </h3>
        <p className='text-gray-600'>
          Try adjusting your search or create a new case to get started.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {cases.map(caseItem => (
          <div
            key={caseItem.id}
            className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer'
            onClick={() => handleCaseClick(caseItem.id)}
          >
            {/* Header */}
            <div className='flex items-start justify-between mb-3'>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-gray-900 mb-1 line-clamp-2'>
                  {caseItem.title}
                </h3>
                <span className='inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>
                  {caseItem.category}
                </span>
              </div>
              <button
                onClick={e => handleFavoriteToggle(e, caseItem.id)}
                className='p-2 hover:bg-gray-50 rounded-lg transition-colors'
                title={
                  caseItem.favorites.length > 0
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              >
                <svg
                  className={`w-5 h-5 ${caseItem.favorites.length > 0 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                  />
                </svg>
              </button>
            </div>

            {/* Description Preview */}
            <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
              {caseItem.description}
            </p>

            {/* Images Preview */}
            {(caseItem.image1Url ||
              caseItem.image2Url ||
              caseItem.image3Url) && (
              <div className='flex gap-2 mb-4'>
                {[caseItem.image1Url, caseItem.image2Url, caseItem.image3Url]
                  .filter((url): url is string => Boolean(url))
                  .slice(0, 3)
                  .map((imageUrl, index) => (
                    <div
                      key={index}
                      className='w-16 h-16 bg-gray-100 rounded-lg overflow-hidden'
                    >
                      <Image
                        src={imageUrl}
                        alt={`Case image ${index + 1}`}
                        width={64}
                        height={64}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  ))}
              </div>
            )}

            {/* Footer */}
            <div className='flex items-center justify-between text-sm text-gray-500'>
              <div className='flex items-center gap-4'>
                <span className='flex items-center gap-1'>
                  <svg
                    className='w-4 h-4'
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
                  {caseItem._count.comments}
                </span>
                <span className='flex items-center gap-1'>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                    />
                  </svg>
                  {caseItem._count.favorites}
                </span>
              </div>
              <span>{new Date(caseItem.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !loading && <div ref={observerRef} className='h-4' />}

      {/* End of results */}
      {!hasMore && cases.length > 0 && (
        <div className='text-center py-8 text-gray-500'>
          <p>You&apos;ve reached the end of the cases</p>
        </div>
      )}
    </div>
  );
}
