'use client';
import { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';

type LogItem = {
  id: string;
  date: string;
  count: number;
  notes: string | null;
  procedure: { id: string; name: string };
  verification: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string | null;
    timestamp: string | null;
  } | null;
};

export default function MyLogsPage() {
  const [items, setItems] = useState<LogItem[]>([]);
  useEffect(() => {
    fetch('/api/logs')
      .then((r) => r.json())
      .then((d) => setItems(d.logs || []));
  }, []);
  return (
    <div className="max-w-3xl mx-auto p-6">
      <BackButton className="mb-4" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Logs</h1>
        <a href="/logs/new" className="underline">
          New
        </a>
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{it.procedure.name}</div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100">
                {it.verification?.status ?? 'PENDING'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {new Date(it.date).toLocaleString()}
              {' · '}count: {it.count}
            </div>
            {it.notes && <div className="text-sm mt-1">{it.notes}</div>}
            {it.verification?.reason && (
              <div className="text-xs mt-1 text-gray-700">Note: {it.verification.reason}</div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-600">No logs yet.</p>}
      </div>
    </div>
  );
}
