'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProcedureKnowledgeFavorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'PROCEDURE' | 'KNOWLEDGE';
  createdAt: string;
}

interface ItemDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  rotation: string;
  isFavorited: boolean;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<ProcedureKnowledgeFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{
    favorite: ProcedureKnowledgeFavorite;
    details: ItemDetails;
  } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/procedure-knowledge-favorites');
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleItemClick = async (favorite: ProcedureKnowledgeFavorite) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(
        `/api/procedure-knowledge-details?itemId=${favorite.itemId}&itemType=${favorite.itemType}`,
      );
      if (response.ok) {
        const details = await response.json();
        setSelectedItem({ favorite, details });
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRemoveFavorite = async (favorite: ProcedureKnowledgeFavorite) => {
    try {
      const response = await fetch('/api/procedure-knowledge-favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: favorite.itemId,
          itemType: favorite.itemType,
        }),
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
        setSelectedItem(null);
      } else {
        alert('Error removing from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error removing from favorites');
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-2"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600 mt-2">Your saved procedures and knowledge topics</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{favorites.length}</div>
              <div className="text-sm text-gray-600">Total Favorites</div>
            </div>
          </div>

          {/* Favorites Grid */}
          {favorites.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-4">
                Start adding procedures and knowledge topics to your favorites by clicking the star
                icon next to items in your rotations.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(favorite)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        favorite.itemType === 'PROCEDURE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800',
                      )}
                    >
                      {favorite.itemType === 'PROCEDURE' ? 'Procedure' : 'Knowledge'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite);
                      }}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      title="Remove from favorites"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{favorite.itemId}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(favorite.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {detailsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      selectedItem.favorite.itemType === 'PROCEDURE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800',
                    )}
                  >
                    {selectedItem.favorite.itemType === 'PROCEDURE' ? 'Procedure' : 'Knowledge'}
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedItem.details.name}
                </h3>

                <p className="text-gray-600 mb-4">{selectedItem.details.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Category:</span>
                    {selectedItem.details.category}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Rotation:</span>
                    {selectedItem.details.rotation}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    href="/dashboard"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Go to Full Page
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// Helper function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
