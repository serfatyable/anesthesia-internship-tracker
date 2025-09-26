'use client';

import { InternSummary } from '@/lib/domain/progress';
import { cn } from '@/lib/ui/cn';
import Link from 'next/link';
import { VirtualList } from '@/components/ui/VirtualList';
import { useMemo, useState } from 'react';

interface OptimizedInternsTableProps {
  interns: InternSummary[];
  className?: string;
}

export function OptimizedInternsTable({ interns, className }: OptimizedInternsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const shouldUseVirtualScrolling = interns.length > 50;
  const itemHeight = 60; // Approximate height of each row

  // Filter interns based on search term
  const filteredInterns = useMemo(() => {
    if (!searchTerm) return interns;

    return interns.filter(
      (intern) =>
        intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [interns, searchTerm]);

  const renderInternRow = useMemo(() => {
    const Component = (intern: InternSummary) => (
      <div
        key={intern.id}
        className="flex items-center border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-4 py-3"
      >
        <div className="flex-1 min-w-0">
          <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{intern.name}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{intern.email}</div>
        </div>
        <div className="flex items-center space-x-4 min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
              {intern.totalVerified}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              {intern.totalPending}
            </span>
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 flex-shrink-0">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${intern.completionPercentage}%` }}
              />
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
              {intern.completionPercentage}%
            </span>
          </div>
          <Link
            href={`/dashboard?userId=${intern.id}&tab=intern`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
    );
    Component.displayName = 'InternRow';
    return Component;
  }, []);

  if (interns.length === 0) {
    return (
      <div
        className={cn('rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6', className)}
      >
        <h3 className="text-lg font-semibold mb-4">Interns</h3>
        <p className="text-zinc-500 text-sm">No interns found</p>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6', className)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Interns ({filteredInterns.length})</h3>
        <input
          type="text"
          placeholder="Search interns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {shouldUseVirtualScrolling ? (
        <VirtualList
          items={filteredInterns}
          itemHeight={itemHeight}
          containerHeight={400}
          renderItem={renderInternRow}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700"
        />
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-0">
            {filteredInterns.map((intern) => renderInternRow(intern))}
          </div>
        </div>
      )}
    </div>
  );
}

OptimizedInternsTable.displayName = 'OptimizedInternsTable';
