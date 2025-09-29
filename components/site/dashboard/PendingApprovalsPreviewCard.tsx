'use client';

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/ui/cn';

interface PendingItem {
  id: string;
  procedureName: string;
  internName: string;
  date: Date;
  count: number;
}

interface PendingApprovalsPreviewCardProps {
  pendingItems: PendingItem[];
  className?: string;
}

export const PendingApprovalsPreviewCard = memo(function PendingApprovalsPreviewCard({
  pendingItems,
  className,
}: PendingApprovalsPreviewCardProps) {
  // Group items by intern name
  const groupedItems = pendingItems.reduce(
    (acc, item) => {
      const internName = item.internName;
      if (!acc[internName]) {
        acc[internName] = [];
      }
      acc[internName].push(item);
      return acc;
    },
    {} as Record<string, PendingItem[]>,
  );

  const totalPending = pendingItems.reduce((sum, item) => sum + item.count, 0);
  const totalItems = pendingItems.length;

  return (
    <Link
      href="/pending-approvals"
      className={cn(
        'block bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group h-64 flex flex-col',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
            <svg
              className="w-7 h-7 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">
              Pending Approvals
            </h3>
            <p className="text-sm text-gray-600">
              {totalItems} items from {Object.keys(groupedItems).length} interns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-700">{totalPending}</div>
            <div className="text-xs text-gray-600">Total tasks</div>
          </div>
          <svg
            className="w-6 h-6 text-gray-400 group-hover:text-yellow-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex min-h-0">
        {totalItems === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-500 text-lg font-medium">No pending approvals</div>
              <p className="text-sm text-gray-400 mt-1">All verifications are up to date!</p>
            </div>
          </div>
        ) : (
          <div
            className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
            style={{ maxHeight: '11rem' }}
          >
            {Object.entries(groupedItems)
              .slice(0, 6)
              .map(([internName, items]) => (
                <div
                  key={internName}
                  className="bg-white/60 rounded-lg p-3 border border-yellow-200/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {internName}
                    </span>
                    <span className="text-xs text-yellow-600 font-bold bg-yellow-100 px-2 py-1 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="text-xs text-gray-600 flex items-center justify-between"
                      >
                        <span className="truncate flex-1 mr-2">{item.procedureName}</span>
                        <span className="text-yellow-600 font-semibold text-xs">{item.count}</span>
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{items.length - 2} more...
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {Object.keys(groupedItems).length > 6 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500 bg-white/40 px-3 py-1 rounded-full">
            +{Object.keys(groupedItems).length - 6} more interns
          </span>
        </div>
      )}
    </Link>
  );
});
