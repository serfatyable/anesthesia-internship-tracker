'use client';

import { useState, useEffect, memo } from 'react';
import { InternSearchBar } from './InternSearchBar';
import { CaseReviewCard } from './CaseReviewCard';
import { FavoriteInternCard } from './FavoriteInternCard';
import { PendingApprovalsPreviewCard } from './PendingApprovalsPreviewCard';
import { cn } from '@/lib/ui/cn';
import { useRouter, useSearchParams } from 'next/navigation';

interface Intern {
  id: string;
  name: string | null;
  email: string;
}

interface FavoriteIntern {
  intern: {
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
  };
  progress: {
    summary: {
      totalRequired: number;
      totalVerified: number;
      totalPending: number;
      completionPercentage: number;
    };
    rotations: Array<{
      rotationId: string;
      rotationName: string;
      required: number;
      verified: number;
      pending: number;
      completionPercentage: number;
      state: string;
    }>;
    pendingVerifications: Array<{
      id: string;
      procedureName: string;
      date: Date;
      count: number;
    }>;
  } | null;
}

interface PendingItem {
  id: string;
  procedureName: string;
  internName: string;
  internId: string;
  date: Date;
  count: number;
  createdAt: Date;
}

interface TutorDashboardProps {
  interns: Intern[];
  totalInterns: number;
  page: number;
  limit: number;
  className?: string;
}

export const TutorDashboard = memo(function TutorDashboard({
  interns,
  totalInterns,
  page,
  limit,
  className,
}: TutorDashboardProps) {
  const [favoriteInterns, setFavoriteInterns] = useState<FavoriteIntern[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const totalPages = Math.ceil(totalInterns / limit);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [favoritesResponse, pendingResponse] = await Promise.all([
          fetch('/api/favorite-interns'),
          fetch('/api/pending-approvals'),
        ]);

        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          setFavoriteInterns(favoritesData.favoriteInterns || []);
        }

        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingItems(pendingData.pendingItems || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('internPage', String(newPage));
    router.push(`?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-medium mb-4">Search Interns</h2>
        <InternSearchBar interns={interns} />
      </div>

      {/* Vertical Stack Layout */}
      <div className="space-y-6">
        {/* Case Review Card */}
        <div className="w-full">
          <CaseReviewCard />
        </div>

        {/* Pending Approvals Preview Card */}
        <div className="w-full">
          <PendingApprovalsPreviewCard pendingItems={pendingItems} />
        </div>
      </div>

      {/* Grid Layout for Favorite Interns */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Favorite Interns Cards */}
        {favoriteInterns.map((favoriteIntern) => (
          <div key={favoriteIntern.intern.id} className="lg:col-span-1">
            {favoriteIntern.progress ? (
              <FavoriteInternCard
                intern={favoriteIntern.intern}
                progress={favoriteIntern.progress}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-500 mb-2">
                    {favoriteIntern.intern.name || 'Unknown Intern'}
                  </div>
                  <div className="text-sm text-gray-400">Unable to load progress data</div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Empty state for no favorites */}
        {favoriteInterns.length === 0 && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
              <div className="text-gray-500 mb-2">No favorite interns yet</div>
              <p className="text-sm text-gray-400">
                Search for an intern above and add them to your favorites to see their progress
                here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
