'use client';

import { useState } from 'react';
// Define the interface locally to avoid circular imports
interface Favorite {
  id: string;
  userId: string;
  caseId: string;
  createdAt: string;
  case: {
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
  };
}
import { useRouter } from 'next/navigation';

interface FavoritesCardProps {
  favorites: Favorite[];
  onFavoriteToggle: (caseId: string, favorited: boolean) => void;
}

export function FavoritesCard({ favorites, onFavoriteToggle }: FavoritesCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();

  const handleCaseClick = (caseId: string) => {
    router.push(`/case-review/${caseId}`);
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Favorites</h3>
            <p className="text-sm text-gray-600">{favorites.length} saved cases</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
        >
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCaseClick(favorite.case.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{favorite.case.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">Category: {favorite.case.category}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{favorite.case._count.comments} comments</span>
                    <span>{favorite.case._count.favorites} favorites</span>
                    <span>{new Date(favorite.case.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteToggle(favorite.case.id, false);
                  }}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                  title="Remove from favorites"
                >
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
