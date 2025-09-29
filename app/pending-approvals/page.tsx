'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';

interface PendingItem {
  id: string;
  logEntryId: string;
  procedureName: string;
  internName: string;
  internId: string;
  date: string;
  count: number;
  notes: string | null;
  createdAt: string;
}

interface GroupedItems {
  [internName: string]: PendingItem[];
}

export default function PendingApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groupedItems, setGroupedItems] = useState<GroupedItems>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Redirect if not authenticated or not a tutor
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user.role !== 'TUTOR' && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch pending approvals
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const response = await fetch('/api/pending-approvals');
        if (!response.ok) throw new Error('Failed to fetch pending approvals');

        const data = await response.json();
        setGroupedItems(data.groupedItems || {});
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session && (session.user.role === 'TUTOR' || session.user.role === 'ADMIN')) {
      fetchPendingApprovals();
    }
  }, [session]);

  const handleApproval = async (logEntryId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessing(logEntryId);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logEntryId,
          status,
        }),
      });

      if (response.ok) {
        // Refresh the data
        const refreshResponse = await fetch('/api/pending-approvals');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setGroupedItems(data.groupedItems || {});
        }
      } else {
        console.error('Failed to update verification status');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  const totalPending = Object.values(groupedItems).reduce(
    (sum, items) => sum + items.reduce((itemSum, item) => itemSum + item.count, 0),
    0,
  );

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <BackButton className="mb-4" />

        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
          <p className="text-gray-600">
            {totalPending} total tasks from {Object.keys(groupedItems).length} interns
          </p>
        </div>
      </div>

      {/* Grouped by Intern */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([internName, items]) => (
          <div key={internName} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{internName}</h2>
                <p className="text-sm text-gray-600">{items.length} items pending</p>
              </div>
              <Link
                href={`/intern/${items[0]?.internId || ''}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Intern Details →
              </Link>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{item.procedureName}</div>
                    <div className="text-sm text-gray-700">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Count: {item.count}</div>
                  {item.notes && (
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Notes:</strong> {item.notes}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(item.logEntryId, 'APPROVED')}
                      disabled={processing === item.logEntryId}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === item.logEntryId ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleApproval(item.logEntryId, 'REJECTED')}
                      disabled={processing === item.logEntryId}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === item.logEntryId ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedItems).length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-500 text-lg">No pending approvals</div>
          <p className="text-gray-400 mt-2">All verifications are up to date!</p>
        </div>
      )}
    </main>
  );
}
