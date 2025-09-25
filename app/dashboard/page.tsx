'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  InternDashboard as InternDashboardType,
  DashboardOverview as DashboardOverviewType,
} from '@/lib/domain/progress';
import { InternDashboard } from '@/components/site/dashboard/InternDashboard';
import { DashboardOverview } from '@/components/site/dashboard/DashboardOverview';
import { CardTile } from '@/components/site/CardTile';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<InternDashboardType | DashboardOverviewType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('INTERN');

  const userId = searchParams.get('userId');
  const tab = searchParams.get('tab') || 'intern';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          ...(userId && { userId }),
          tab,
        });

        const response = await fetch(`/api/progress?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }

        const result = await response.json();
        setData(result);

        // Try to get user role from session (this is a simplified approach)
        // In a real app, you might want to pass this from the server or get it from a context
        const roleResponse = await fetch('/api/session');
        if (roleResponse.ok) {
          const sessionData = await roleResponse.json();
          setUserRole(sessionData.user?.role || 'INTERN');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, tab]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {tab === 'overview' ? 'Overview' : 'Progress Tracking'}
            {userId && userId !== 'current' && ' - User View'}
          </p>
        </header>

        {/* Main Dashboard Content */}
        {data && (
          <>
            {tab === 'overview' && 'interns' in data ? (
              <DashboardOverview overview={data} />
            ) : 'summary' in data ? (
              <InternDashboard dashboard={data} userId={userId || 'current'} />
            ) : null}
          </>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardTile title="Log Procedures" href="/logs/new" desc="Add new procedure logs" />
            <CardTile title="View All Logs" href="/logs" desc="Browse your procedure history" />
            <CardTile title="Verify Queue" href="/verify" desc="Review pending verifications" />
            {userRole === 'TUTOR' || userRole === 'ADMIN' ? (
              <CardTile
                title="Overview Dashboard"
                href="/dashboard?tab=overview"
                desc="View all interns progress"
              />
            ) : null}
            <CardTile title="Rotations" href="/rotations" desc="Browse rotation requirements" />
            <CardTile title="Settings" href="/admin" desc="Manage your account" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
