'use client';
import { useEffect, useState } from 'react';

type PendingItem = {
  id: string;
  date: string;
  count: number;
  notes: string | null;
  intern: {
    id: string;
    name: string | null;
    email: string | null;
    _count?: {
      logs: number;
      verifications: number;
    };
  };
  procedure: {
    id: string;
    name: string;
    description?: string | null;
    rotation?: {
      name: string;
    };
  };
  verification?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  };
  createdAt: string;
};

type VerificationModalProps = {
  item: PendingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, reason: string) => void;
  onNeedsRevision: (id: string, reason: string) => void;
};

function VerificationModal({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onNeedsRevision,
}: VerificationModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'needs_revision' | null>(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'approve') {
      onApprove(item.id, comment.trim() || undefined);
    } else if (action === 'reject') {
      if (!reason.trim()) {
        alert('Reason for rejection is required');
        return;
      }
      onReject(item.id, reason.trim());
    } else if (action === 'needs_revision') {
      if (!reason.trim()) {
        alert('Reason for revision is required');
        return;
      }
      onNeedsRevision(item.id, reason.trim());
    }
    setAction(null);
    setComment('');
    setReason('');
  };

  const handleClose = () => {
    setAction(null);
    setComment('');
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Review Log Entry</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Log Entry Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Procedure Details</h4>
                <p className="text-sm text-gray-600">{item.procedure.name}</p>
                {item.procedure.description && (
                  <p className="text-xs text-gray-500 mt-1">{item.procedure.description}</p>
                )}
                {item.procedure.rotation && (
                  <p className="text-xs text-blue-600 mt-1">
                    Rotation: {item.procedure.rotation.name}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Log Details</h4>
                <p className="text-sm text-gray-600">Count: {item.count}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(item.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {item.notes && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">Notes</h4>
                <p className="text-sm text-gray-600 italic">&ldquo;{item.notes}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Intern Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Intern Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span> {item.intern.name || 'Not provided'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {item.intern.email}
                </p>
              </div>
              {item.intern._count && (
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total Logs:</span> {item.intern._count.logs}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Verifications:</span>{' '}
                    {item.intern._count.verifications}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Form */}
          {!action ? (
            <div className="flex space-x-4">
              <button
                onClick={() => setAction('approve')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => setAction('needs_revision')}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Needs Revision
              </button>
              <button
                onClick={() => setAction('reject')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Reject
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {action === 'approve' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment for the intern..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>
              ) : action === 'needs_revision' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revision Instructions <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-3"
                    required
                  >
                    <option value="">Select revision reason...</option>
                    <option value="Please add more detailed notes">
                      Please add more detailed notes
                    </option>
                    <option value="Please correct the procedure count">
                      Please correct the procedure count
                    </option>
                    <option value="Please select the correct procedure">
                      Please select the correct procedure
                    </option>
                    <option value="Please add missing information">
                      Please add missing information
                    </option>
                    <option value="Other">Other</option>
                  </select>
                  <textarea
                    value={reason === 'Other' ? reason : ''}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide specific instructions for revision..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={3}
                    required={reason === 'Other'}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="Incomplete information">Incomplete information</option>
                    <option value="Incorrect procedure count">Incorrect procedure count</option>
                    <option value="Missing required details">Missing required details</option>
                    <option value="Does not meet standards">Does not meet standards</option>
                    <option value="Other">Other</option>
                  </select>
                  <textarea
                    value={reason === 'Other' ? reason : ''}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide specific details..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    required={reason === 'Other'}
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setAction(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : action === 'needs_revision'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {action === 'approve'
                    ? 'Approve Entry'
                    : action === 'needs_revision'
                      ? 'Request Revision'
                      : 'Reject Entry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyQueuePage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/verify-queue');
      const d = await res.json();
      setItems(d.items || []);
    } catch (error) {
      console.error('Failed to load verification queue:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: string, comment?: string) {
    try {
      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logEntryId: id, status: 'APPROVED', reason: comment }),
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedItem(null);
        load();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.error ? JSON.stringify(errorData.error) : 'Approval failed');
      }
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed');
    }
  }

  async function handleReject(id: string, reason: string) {
    try {
      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logEntryId: id, status: 'REJECTED', reason }),
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedItem(null);
        load();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.error ? JSON.stringify(errorData.error) : 'Rejection failed');
      }
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('Rejection failed');
    }
  }

  async function handleNeedsRevision(id: string, reason: string) {
    try {
      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logEntryId: id, status: 'NEEDS_REVISION', reason }),
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedItem(null);
        load();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.error ? JSON.stringify(errorData.error) : 'Needs revision failed');
      }
    } catch (error) {
      console.error('Needs revision failed:', error);
      alert('Needs revision failed');
    }
  }

  const openModal = (item: PendingItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pending Verifications</h1>
          <p className="text-gray-600">Review and approve or reject log entries</p>
        </div>
        <div className="text-sm text-gray-500">
          {items.length} pending verification{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No pending verifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{item.procedure.name}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.verification?.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : item.verification?.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : item.verification?.status === 'NEEDS_REVISION'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.verification?.status || 'PENDING'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Intern:</span>{' '}
                      {item.intern.name || item.intern.email}
                    </div>
                    <div>
                      <span className="font-medium">Count:</span> {item.count}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>

                  {item.notes && (
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <p className="text-sm text-gray-700 italic">&ldquo;{item.notes}&rdquo;</p>
                    </div>
                  )}

                  {item.procedure.rotation && (
                    <div className="text-sm text-blue-600 mb-3">
                      <span className="font-medium">Rotation:</span> {item.procedure.rotation.name}
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => openModal(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <VerificationModal
        item={selectedItem}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onNeedsRevision={handleNeedsRevision}
      />
    </div>
  );
}
