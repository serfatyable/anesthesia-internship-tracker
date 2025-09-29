'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CaseCreationModal } from '@/components/site/case-review/CaseCreationModal';
import { CasesList } from '@/components/site/case-review/CasesList';
import { FavoritesCard } from '@/components/site/case-review/FavoritesCard';
import { SearchAndFilter } from '@/components/site/case-review/SearchAndFilter';
import { CASE_CATEGORIES } from '@/lib/constants/caseCategories';
import BackButton from '@/components/ui/BackButton';

export interface Case {
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
  _count: {
    comments: number;
    favorites: number;
  };
  favorites: Array<{ id: string }>;
}

export interface Favorite {
  id: string;
  userId: string;
  caseId: string;
  createdAt: string;
  case: Case;
}

export default function CaseReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [mounted, setMounted] = useState(false);

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

  const fetchCases = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '10',
          ...(category !== 'all' && { category }),
          ...(search && { search }),
        });

        const response = await fetch(`/api/cases?${params}`);
        if (!response.ok) throw new Error('Failed to fetch cases');

        const data = await response.json();

        if (reset) {
          setCases(data.cases);
        } else {
          setCases(prev => [...prev, ...data.cases]);
        }

        setHasMore(data.pagination.hasMore);
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    },
    [category, search]
  );

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) throw new Error('Failed to fetch favorites');

      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCases(nextPage);
    }
  }, [loading, hasMore, page, fetchCases]);

  const handleSearch = useCallback(() => {
    setPage(1);
    setCases([]);
    setLoading(true);
    fetchCases(1, true).finally(() => setLoading(false));
  }, [fetchCases]);

  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      setCategory(newCategory);
      setPage(1);
      setCases([]);
      setLoading(true);
      fetchCases(1, true).finally(() => setLoading(false));
    },
    [fetchCases]
  );

  // Initial load
  useEffect(() => {
    if (session) {
      setLoading(true);
      Promise.all([fetchCases(1, true), fetchFavorites()]).finally(() =>
        setLoading(false)
      );
    }
  }, [session, fetchCases, fetchFavorites]);

  const handleCaseCreated = () => {
    setShowCreateModal(false);
    // Refresh cases
    setPage(1);
    setCases([]);
    setLoading(true);
    fetchCases(1, true).finally(() => setLoading(false));
  };

  const handleFavoriteToggle = (caseId: string, favorited: boolean) => {
    // Update local state immediately for better UX
    setCases(prev =>
      prev.map(c =>
        c.id === caseId
          ? {
              ...c,
              _count: {
                ...c._count,
                favorites: favorited
                  ? c._count.favorites + 1
                  : c._count.favorites - 1,
              },
              favorites: favorited ? [{ id: 'temp' }] : [],
            }
          : c
      )
    );

    // Refresh favorites list
    fetchFavorites();
  };

  // Show loading state until component is mounted
  if (!mounted || status === 'loading' || loading) {
    return (
      <main className='max-w-6xl mx-auto p-4'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='space-y-6'>
        {/* Back Button */}
        <BackButton />

        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Case Review</h1>
          <p className='text-gray-600'>
            Share and explore interesting anesthesia and critical care cases
          </p>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={handleCategoryChange}
          categories={CASE_CATEGORIES}
          onSearch={handleSearch}
          onCreateCase={() => setShowCreateModal(true)}
        />

        {/* Favorites Card */}
        {favorites.length > 0 && (
          <FavoritesCard
            favorites={favorites}
            onFavoriteToggle={handleFavoriteToggle}
          />
        )}

        {/* Cases List */}
        <CasesList
          cases={cases}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </div>

      {/* Case Creation Modal */}
      {showCreateModal && (
        <CaseCreationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCaseCreated}
          categories={CASE_CATEGORIES}
        />
      )}
    </main>
  );
}
