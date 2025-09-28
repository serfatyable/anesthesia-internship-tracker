'use client';
import { useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/BackButton';

type PendingItem = {
  id: string;
  date: string;
  count: number;
  notes: string | null;
  intern: { id: string; name: string | null; email: string | null };
  procedure: { id: string; name: string };
};

export default function VerifyQueuePage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  async function load() {
    const res = await fetch('/api/verify-queue');
    const d = await res.json();
    setItems(d.items || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function review(id: string, status: 'APPROVED' | 'REJECTED') {
    let reason: string | undefined = undefined;
    if (status === 'REJECTED') {
      reason = prompt('Reason for rejection?') || '';
      if (!reason.trim()) {
        alert('Reason is required');
        return;
      }
    }
    const res = await fetch('/api/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logEntryId: id, status, reason }),
    });
    if (res.ok) load();
    else {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ? JSON.stringify(j.error) : 'Review failed');
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <BackButton href="/dashboard" className="mb-4">
        Back to Dashboard
      </BackButton>
      <h1 className="text-2xl font-semibold mb-4">Pending Verifications</h1>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{it.procedure.name}</div>
              <div className="text-sm text-gray-700">{new Date(it.date).toLocaleString()}</div>
            </div>
            <div className="text-sm text-gray-600">
              {it.intern.name || it.intern.email} · count: {it.count}
            </div>
            {it.notes && <div className="text-sm mt-1">{it.notes}</div>}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => review(it.id, 'APPROVED')}
                className="bg-black text-white px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => review(it.id, 'REJECTED')}
                className="border px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-600">No pending items.</p>}
      </div>
    </div>
  );
}
