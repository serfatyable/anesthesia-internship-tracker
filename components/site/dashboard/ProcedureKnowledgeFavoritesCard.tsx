'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProcedureKnowledgeFavorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'PROCEDURE' | 'KNOWLEDGE';
  createdAt: string;
}

interface ProcedureKnowledgeFavoritesCardProps {
  onViewAll?: () => void;
}

export function ProcedureKnowledgeFavoritesCard({
  onViewAll,
}: ProcedureKnowledgeFavoritesCardProps) {
  const [favorites, setFavorites] = useState<ProcedureKnowledgeFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/procedure-knowledge-favorites', {
          cache: 'force-cache', // Use cached data when available
        });

        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        } else if (response.status === 401) {
          // User not authenticated, silently fail
          setFavorites([]);
        } else {
          console.error('Error fetching favorites:', response.status);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        // Set empty array on error to prevent infinite loading
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleCardClick = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push('/favorites');
    }
  };

  if (loading) {
    return (
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 h-full'>
        <div className='flex items-center justify-center h-20'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 h-full'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <svg
              className='w-5 h-5 text-blue-600'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Procedure & Knowledge Favorites
            </h3>
            <p className='text-sm text-gray-600'>No favorites yet</p>
          </div>
        </div>
        <p className='text-sm text-gray-600'>
          Start adding procedures and knowledge topics to your favorites by
          clicking the star icon next to items in your rotations.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 h-full'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <svg
              className='w-5 h-5 text-blue-600'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Procedure & Knowledge Favorites
            </h3>
            <p className='text-sm text-gray-600'>
              {favorites.length} saved items
            </p>
          </div>
        </div>
        <button
          onClick={handleCardClick}
          className='text-blue-600 hover:text-blue-700 font-medium text-sm'
        >
          View All →
        </button>
      </div>

      <div className='space-y-3'>
        {favorites.slice(0, 3).map(favorite => (
          <div
            key={favorite.id}
            className='bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => router.push('/favorites')}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    favorite.itemType === 'PROCEDURE'
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                  )}
                />
                <div>
                  <h4 className='font-medium text-gray-900'>
                    {favorite.itemType === 'PROCEDURE'
                      ? 'Procedure'
                      : 'Knowledge'}
                    : {favorite.itemId}
                  </h4>
                  <p className='text-xs text-gray-500'>
                    {new Date(favorite.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <svg
                className='w-4 h-4 text-gray-400'
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
        ))}
        {favorites.length > 3 && (
          <div className='text-center'>
            <p className='text-sm text-gray-500'>
              +{favorites.length - 3} more favorites
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
