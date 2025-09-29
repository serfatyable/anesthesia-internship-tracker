'use client';
import { useState } from 'react';
import BackButton from '@/components/ui/BackButton';

// Mock pending changes (for demo, would be shared state in real app)
const initialPending = [
  {
    id: 'chg1',
    type: 'procedures',
    rotationId: 'rotation1',
    item: { id: 'p5', name: 'New Cardiac Procedure', status: 'pending' },
    action: 'add',
  },
  {
    id: 'chg2',
    type: 'knowledge',
    rotationId: 'rotation2',
    item: { id: 'k4', name: 'New Surgical Knowledge', status: 'pending' },
    action: 'add',
  },
];
const mockRotations = [
  { id: 'rotation1', name: 'Cardiology' },
  { id: 'rotation2', name: 'Surgery' },
  { id: 'rotation3', name: 'Anesthesiology' },
];

export default function PendingApprovalsPage() {
  const [pending, setPending] = useState(initialPending);

  const handleApprove = (chgId: string) => {
    setPending(pending.filter((c) => c.id !== chgId));
    // In real app, would update main data here
  };
  const handleReject = (chgId: string) => {
    setPending(pending.filter((c) => c.id !== chgId));
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <BackButton className="mb-6" />
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>
      <div className="bg-white border rounded-lg p-4 min-h-[200px]">
        {pending.length === 0 ? (
          <div className="text-zinc-400">No pending changes.</div>
        ) : (
          <ul className="divide-y">
            {pending.map((chg) => (
              <li key={chg.id} className="flex items-center gap-3 py-2">
                <span className="flex-1">
                  <span className="font-semibold">
                    {chg.type === 'procedures' ? 'Procedure' : 'Knowledge'}:
                  </span>{' '}
                  {chg.item.name}{' '}
                  <span className="text-zinc-400">
                    ({mockRotations.find((r) => r.id === chg.rotationId)?.name})
                  </span>
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                    {chg.action}
                  </span>
                </span>
                <button
                  onClick={() => handleApprove(chg.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(chg.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
