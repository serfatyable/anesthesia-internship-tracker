'use client';
import { useState } from 'react';
import BackButton from '@/components/ui/BackButton';

// Mock data
const mockRotations = [
  { id: 'rotation1', name: 'Cardiology' },
  { id: 'rotation2', name: 'Surgery' },
  { id: 'rotation3', name: 'Anesthesiology' },
];
const initialProcedures = {
  rotation1: [
    { id: 'p1', name: 'Echocardiogram', status: 'approved' },
    { id: 'p2', name: 'Cardiac Catheterization', status: 'approved' },
  ],
  rotation2: [{ id: 'p3', name: 'Appendectomy', status: 'approved' }],
  rotation3: [{ id: 'p4', name: 'Intubation', status: 'approved' }],
};
const initialKnowledge = {
  rotation1: [{ id: 'k1', name: 'Heart Anatomy', status: 'approved' }],
  rotation2: [{ id: 'k2', name: 'Surgical Instruments', status: 'approved' }],
  rotation3: [{ id: 'k3', name: 'Anesthesia Drugs', status: 'approved' }],
};

export default function AdminRotationsPage() {
  const [selectedRotation, setSelectedRotation] = useState(mockRotations[0]?.id || '');
  const [tab, setTab] = useState('procedures');
  const [procedures, setProcedures] = useState(initialProcedures);
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const [pending, setPending] = useState<
    Array<{
      type: string;
      rotationId: string;
      item: { name: string; id?: string; status?: string };
      action: string;
    }>
  >([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const items =
    tab === 'procedures'
      ? procedures[selectedRotation as keyof typeof procedures]
      : knowledge[selectedRotation as keyof typeof knowledge];

  // Add or edit item
  const handleSave = () => {
    if (!input.trim()) return;
    if (editId) {
      setPending((p) => [
        ...p,
        {
          type: tab,
          rotationId: selectedRotation,
          item: { ...items.find((i) => i.id === editId), name: input },
          action: 'edit',
        },
      ]);
      setEditId(null);
    } else {
      setPending((p) => [
        ...p,
        {
          type: tab,
          rotationId: selectedRotation,
          item: { id: `tmp${Date.now()}`, name: input, status: 'pending' },
          action: 'add',
        },
      ]);
    }
    setInput('');
  };
  // Delete item
  const handleDelete = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setPending((p) => [
        ...p,
        {
          type: tab,
          rotationId: selectedRotation,
          item,
          action: 'delete',
        },
      ]);
    }
  };
  // Start edit
  const startEdit = (id: string) => {
    setEditId(id);
    setInput(items.find((i) => i.id === id)?.name || '');
  };
  // Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    setInput('');
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <BackButton className="mb-6" />
      <h1 className="text-2xl font-bold mb-6">Rotation Item Management</h1>
      <div className="mb-4 flex gap-4 items-center">
        <label className="font-semibold">Rotation:</label>
        <select
          value={selectedRotation}
          onChange={(e) => setSelectedRotation(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {mockRotations.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <div className="ml-8 flex gap-2">
          <button
            onClick={() => setTab('procedures')}
            className={`px-3 py-1 rounded ${tab === 'procedures' ? 'bg-blue-600 text-white' : 'bg-zinc-200'}`}
          >
            Procedures
          </button>
          <button
            onClick={() => setTab('knowledge')}
            className={`px-3 py-1 rounded ${tab === 'knowledge' ? 'bg-blue-600 text-white' : 'bg-zinc-200'}`}
          >
            Knowledge Items
          </button>
        </div>
      </div>
      <div className="bg-white border rounded-lg p-4 min-h-[200px]">
        <ul className="divide-y">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-2">
              <span className="flex-1">{i.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${i.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                {i.status}
              </span>
              <button
                onClick={() => startEdit(i.id)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(i.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Add ${tab === 'procedures' ? 'procedure' : 'knowledge item'}`}
            className="border rounded px-2 py-1 flex-1"
          />
          {editId ? (
            <>
              <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded">
                Save
              </button>
              <button onClick={cancelEdit} className="bg-zinc-200 px-3 py-1 rounded">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded">
              Add
            </button>
          )}
        </div>
      </div>
      <div className="mt-6 text-zinc-500 text-sm">
        All changes require approval before going live.
      </div>
    </main>
  );
}
