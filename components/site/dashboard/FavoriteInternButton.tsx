'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/ui/cn';

interface FavoriteInternButtonProps {
  internId: string;
  isFavorite: boolean;
  tutorId: string;
  className?: string;
}

export function FavoriteInternButton({
  internId,
  isFavorite,
  tutorId: _tutorId, // eslint-disable-line @typescript-eslint/no-unused-vars
  className,
}: FavoriteInternButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);

  const handleToggleFavorite = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/favorite-intern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internId,
          isFavorite: favorite,
        }),
      });

      if (response.ok) {
        setFavorite(!favorite);
      } else {
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  }, [internId, favorite]);

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        favorite
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200',
        className
      )}
    >
      <svg
        className={cn(
          'w-5 h-5 transition-colors',
          favorite ? 'text-yellow-600' : 'text-gray-400'
        )}
        fill={favorite ? 'currentColor' : 'none'}
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
      <span className='font-medium'>
        {isLoading
          ? 'Updating...'
          : favorite
            ? 'Favorited'
            : 'Add to Favorites'}
      </span>
    </button>
  );
}
