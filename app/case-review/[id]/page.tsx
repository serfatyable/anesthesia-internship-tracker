'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { CaseDetail } from '@/components/site/case-review/CaseDetail';
import { CommentsSection } from '@/components/site/case-review/CommentsSection';

export interface Comment {
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
}

export interface CaseWithComments {
  id: string;
  title: string;
  category: string;
  description: string;
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
  comments: Comment[];
  _count: {
    comments: number;
    favorites: number;
  };
  favorites: Array<{ id: string }>;
}

export default function CaseDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [caseData, setCaseData] = useState<CaseWithComments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const caseId = params.id as string;

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!mounted) return;
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router, mounted]);

  const fetchCase = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Case not found');
        } else {
          throw new Error('Failed to fetch case');
        }
        return;
      }

      const data = await response.json();
      setCaseData(data);
    } catch (err) {
      console.error('Error fetching case:', err);
      setError('Failed to load case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (session && caseId) {
      fetchCase();
    }
  }, [session, caseId, fetchCase]);

  const handleFavoriteToggle = async (favorited: boolean) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to toggle favorite');

      // Update local state
      if (caseData) {
        setCaseData({
          ...caseData,
          _count: {
            ...caseData._count,
            favorites: favorited ? caseData._count.favorites + 1 : caseData._count.favorites - 1,
          },
          favorites: favorited ? [{ id: 'temp' }] : [],
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCommentAdded = () => {
    // Refresh case data to get updated comments
    fetchCase();
  };

  // Show loading state until component is mounted
  if (!mounted || status === 'loading' || loading) {
    return (
      <main className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/case-review')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Cases
          </button>
        </div>
      </main>
    );
  }

  if (!caseData) {
    return (
      <main className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/case-review')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Cases
        </button>

        {/* Case Detail */}
        <CaseDetail caseData={caseData} onFavoriteToggle={handleFavoriteToggle} />

        {/* Comments Section */}
        <CommentsSection
          caseId={caseId}
          comments={caseData.comments}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </main>
  );
}
