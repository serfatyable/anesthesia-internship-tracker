'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
// Define the interface locally to avoid circular imports
interface CaseWithComments {
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
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
      email: string;
    };
    replies: Array<{
      id: string;
      content: string;
      createdAt: string;
      author: {
        id: string;
        name: string | null;
        email: string;
      };
    }>;
  }>;
}

interface CaseDetailProps {
  caseData: CaseWithComments;
  onFavoriteToggle: (favorited: boolean) => void;
}

export function CaseDetail({ caseData, onFavoriteToggle }: CaseDetailProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing edit options
  useEffect(() => {
    setMounted(true);
  }, []);

  const images = [caseData.image1Url, caseData.image2Url, caseData.image3Url].filter(
    (url): url is string => Boolean(url),
  );

  const handleFavoriteClick = async () => {
    const isCurrentlyFavorited = caseData.favorites.length > 0;
    onFavoriteToggle(!isCurrentlyFavorited);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDeleteClick = async () => {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/cases/${caseData.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete case');
      }

      // Redirect to cases list
      window.location.href = '/case-review';
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Failed to delete case. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {caseData.category}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{caseData._count.comments} comments</span>
            <span>{caseData._count.favorites} favorites</span>
            <span>Created {new Date(caseData.createdAt).toLocaleDateString()}</span>
            {caseData.updatedAt !== caseData.createdAt && (
              <span>Updated {new Date(caseData.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-lg transition-colors ${
              caseData.favorites.length > 0
                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-yellow-500'
            }`}
            title={caseData.favorites.length > 0 ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-5 h-5 ${caseData.favorites.length > 0 ? 'fill-current' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          {/* Edit/Delete Actions - Only show for case author */}
          {mounted && isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Edit case"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete case"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Case Description</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{caseData.description}</p>
        </div>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Images</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <Image
                  src={imageUrl}
                  alt={`Case image ${index + 1}`}
                  width={300}
                  height={192}
                  className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setExpandedImage(imageUrl)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={expandedImage}
              alt="Expanded case image"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              unoptimized
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
