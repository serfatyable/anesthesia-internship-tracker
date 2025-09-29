'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { FavoriteInternButton } from '@/components/site/dashboard/FavoriteInternButton';
import BackButton from '@/components/ui/BackButton';

export default function InternPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const internId = params?.id as string;

  const [internData, setInternData] = useState<{
    intern: { id: string; name: string; email: string; createdAt: string };
    isFavorite: boolean;
    activeRotation: {
      id: string;
      name: string;
      required: number;
      verified: number;
      pending: number;
      completionPercentage: number;
      procedures: {
        pending: Array<{
          id: string;
          name: string;
          logEntryId: string;
          count: number;
          date: string;
          notes?: string;
        }>;
        completed: Array<{
          id: string;
          name: string;
          count: number;
          date: string;
          notes?: string;
        }>;
        notStarted: Array<{
          id: string;
          name: string;
          required: number;
        }>;
      };
      knowledge: {
        pending: Array<{
          id: string;
          name: string;
          date: string;
          notes?: string;
          logEntryId: string;
        }>;
        completed: Array<{
          id: string;
          name: string;
          date: string;
          notes?: string;
        }>;
        notStarted: Array<{
          id: string;
          name: string;
        }>;
      };
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    proceduresPending: false,
    proceduresCompleted: false,
    proceduresNotStarted: false,
    knowledgePending: false,
    knowledgeCompleted: false,
    knowledgeNotStarted: false,
  });

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

  // Fetch intern data
  useEffect(() => {
    const fetchInternData = async () => {
      if (!session || !internId) return;

      console.log('Fetching intern data for:', internId);

      try {
        const response = await fetch(`/api/intern/${internId}`);
        console.log('API Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(
            `Failed to fetch intern data: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log('API Response data:', data);
        setInternData(data);
      } catch (error) {
        console.error('Error fetching intern data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (
      session &&
      (session.user.role === 'TUTOR' || session.user.role === 'ADMIN')
    ) {
      fetchInternData();
    }
  }, [session, internId]);

  const toggleSection = (sectionName: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const handleApproval = async (
    logEntryId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
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
        const refreshResponse = await fetch(`/api/intern/${internId}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setInternData(data);
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

  console.log('Render state:', {
    status,
    loading,
    session: !!session,
    internData: !!internData,
    internId,
  });

  if (status === 'loading' || loading) {
    console.log('Showing loading state');
    return (
      <main className='max-w-6xl mx-auto p-4'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>Loading intern data...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    console.log('No session, returning null');
    return null; // Will redirect
  }

  if (!internData) {
    console.log('No internData, showing error state');
    return (
      <main className='max-w-6xl mx-auto p-4'>
        <div className='mb-6'>
          <BackButton className='mb-4' />
        </div>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-red-800 mb-2'>
            Error Loading Intern Data
          </h2>
          <p className='text-red-600'>
            Unable to load data for intern ID: {internId}
          </p>
          <p className='text-sm text-red-500 mt-2'>
            Check the browser console for more details.
          </p>
        </div>
      </main>
    );
  }

  const { intern, isFavorite, activeRotation } = internData;

  // Collapsible section component
  const CollapsibleSection = ({
    title,
    count,
    isExpanded,
    onToggle,
    children,
    colorClass = 'text-gray-700',
  }: {
    title: string;
    count: number;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    colorClass?: string;
  }) => (
    <div className='mb-6'>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full text-left font-medium ${colorClass} hover:bg-gray-50 p-3 rounded-lg transition-colors`}
      >
        <span>
          {title} ({count})
        </span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>
      {isExpanded && (
        <div className='mt-3 animate-in slide-in-from-top-2 duration-200'>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='mb-6'>
        <BackButton className='mb-4' />

        {/* Intern Header */}
        <div className='flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {intern.name || 'Unknown Intern'}
            </h1>
            <p className='text-gray-600 mt-1'>{intern.email}</p>
            <p className='text-sm text-gray-500 mt-1'>
              Intern since {new Date(intern.createdAt).toLocaleDateString()}
            </p>
          </div>
          <FavoriteInternButton
            internId={internId}
            isFavorite={isFavorite}
            tutorId={session.user.id}
          />
        </div>
      </div>

      <div className='space-y-6'>
        {/* Overall Progress Card */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Overall Progress
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Procedures Progress */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Procedures
                </span>
                <span className='text-sm text-gray-600'>
                  {activeRotation.verified} / {activeRotation.required}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${Math.min((activeRotation.verified / activeRotation.required) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                {activeRotation.pending} pending approval
              </p>
            </div>

            {/* Knowledge Progress */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Knowledge
                </span>
                <span className='text-sm text-gray-600'>
                  {activeRotation.verified} / {activeRotation.required}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-600 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${Math.min((activeRotation.verified / activeRotation.required) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                {activeRotation.pending} pending approval
              </p>
            </div>
          </div>
        </div>

        {/* Current Rotation Card */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Current Rotation
          </h2>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>
                {activeRotation.name}
              </h3>
              <p className='text-sm text-gray-600'>Active Rotation</p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-blue-600'>
                {activeRotation.completionPercentage}%
              </div>
              <div className='text-sm text-gray-500'>Complete</div>
            </div>
          </div>
          <div className='mt-4 w-full bg-gray-200 rounded-full h-3'>
            <div
              className='bg-blue-600 h-3 rounded-full transition-all duration-300'
              style={{ width: `${activeRotation.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Procedures Section */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Procedures
          </h2>

          {/* Pending for Approval */}
          {activeRotation.procedures.pending.length > 0 && (
            <CollapsibleSection
              title='Pending for Approval'
              count={activeRotation.procedures.pending.length}
              isExpanded={expandedSections.proceduresPending}
              onToggle={() => toggleSection('proceduresPending')}
              colorClass='text-yellow-700'
            >
              <div className='space-y-3'>
                {activeRotation.procedures.pending.map(
                  (item: {
                    id: string;
                    name: string;
                    logEntryId: string;
                    count: number;
                    date: string;
                    notes?: string;
                  }) => (
                    <div
                      key={item.id}
                      className='border border-yellow-200 rounded-lg p-4 bg-yellow-50'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='font-medium text-gray-900'>
                          {item.name}
                        </div>
                        <div className='text-sm text-gray-600'>
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className='text-sm text-gray-600 mb-3'>
                        Count: {item.count}
                      </div>
                      {item.notes && (
                        <div className='text-sm text-gray-600 mb-3'>
                          <strong>Notes:</strong> {item.notes}
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <button
                          onClick={() =>
                            handleApproval(item.logEntryId, 'APPROVED')
                          }
                          disabled={processing === item.logEntryId}
                          className='bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {processing === item.logEntryId
                            ? 'Processing...'
                            : 'Approve'}
                        </button>
                        <button
                          onClick={() =>
                            handleApproval(item.logEntryId, 'REJECTED')
                          }
                          disabled={processing === item.logEntryId}
                          className='bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {processing === item.logEntryId
                            ? 'Processing...'
                            : 'Reject'}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Completed */}
          {activeRotation.procedures.completed.length > 0 && (
            <CollapsibleSection
              title='Completed'
              count={activeRotation.procedures.completed.length}
              isExpanded={expandedSections.proceduresCompleted}
              onToggle={() => toggleSection('proceduresCompleted')}
              colorClass='text-green-700'
            >
              <div className='space-y-2'>
                {activeRotation.procedures.completed.map(
                  (item: {
                    id: string;
                    name: string;
                    count: number;
                    date: string;
                    notes?: string;
                  }) => (
                    <div
                      key={item.id}
                      className='border border-green-200 rounded-lg p-3 bg-green-50'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='font-medium text-gray-900'>
                          {item.name}
                        </div>
                        <div className='text-sm text-gray-600'>
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className='text-sm text-gray-600'>
                        Count: {item.count}
                      </div>
                      {item.notes && (
                        <div className='text-sm text-gray-600 mt-1'>
                          <strong>Notes:</strong> {item.notes}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Not Yet Done */}
          {activeRotation.procedures.notStarted.length > 0 && (
            <CollapsibleSection
              title='Not Yet Done'
              count={activeRotation.procedures.notStarted.length}
              isExpanded={expandedSections.proceduresNotStarted}
              onToggle={() => toggleSection('proceduresNotStarted')}
              colorClass='text-gray-700'
            >
              <div className='space-y-2'>
                {activeRotation.procedures.notStarted.map(
                  (item: { id: string; name: string; required: number }) => (
                    <div
                      key={item.id}
                      className='border border-gray-200 rounded-lg p-3 bg-gray-50'
                    >
                      <div className='font-medium text-gray-900'>
                        {item.name}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Required: {item.required}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Knowledge Section */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Knowledge Topics
          </h2>

          {/* Pending for Approval */}
          {activeRotation.knowledge.pending.length > 0 && (
            <CollapsibleSection
              title='Pending for Approval'
              count={activeRotation.knowledge.pending.length}
              isExpanded={expandedSections.knowledgePending}
              onToggle={() => toggleSection('knowledgePending')}
              colorClass='text-yellow-700'
            >
              <div className='space-y-3'>
                {activeRotation.knowledge.pending.map(item => (
                  <div
                    key={item.id}
                    className='border border-yellow-200 rounded-lg p-4 bg-yellow-50'
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <div className='font-medium text-gray-900'>
                        {item.name}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    {item.notes && (
                      <div className='text-sm text-gray-600 mb-3'>
                        <strong>Notes:</strong> {item.notes}
                      </div>
                    )}
                    <div className='flex gap-2'>
                      <button
                        onClick={() =>
                          handleApproval(item.logEntryId, 'APPROVED')
                        }
                        disabled={processing === item.logEntryId}
                        className='bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {processing === item.logEntryId
                          ? 'Processing...'
                          : 'Approve'}
                      </button>
                      <button
                        onClick={() =>
                          handleApproval(item.logEntryId, 'REJECTED')
                        }
                        disabled={processing === item.logEntryId}
                        className='bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {processing === item.logEntryId
                          ? 'Processing...'
                          : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Completed */}
          {activeRotation.knowledge.completed.length > 0 && (
            <CollapsibleSection
              title='Completed'
              count={activeRotation.knowledge.completed.length}
              isExpanded={expandedSections.knowledgeCompleted}
              onToggle={() => toggleSection('knowledgeCompleted')}
              colorClass='text-green-700'
            >
              <div className='space-y-2'>
                {activeRotation.knowledge.completed.map(item => (
                  <div
                    key={item.id}
                    className='border border-green-200 rounded-lg p-3 bg-green-50'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='font-medium text-gray-900'>
                        {item.name}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    {item.notes && (
                      <div className='text-sm text-gray-600 mt-1'>
                        <strong>Notes:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Not Yet Done */}
          {activeRotation.knowledge.notStarted.length > 0 && (
            <CollapsibleSection
              title='Not Yet Done'
              count={activeRotation.knowledge.notStarted.length}
              isExpanded={expandedSections.knowledgeNotStarted}
              onToggle={() => toggleSection('knowledgeNotStarted')}
              colorClass='text-gray-700'
            >
              <div className='space-y-2'>
                {activeRotation.knowledge.notStarted.map(item => (
                  <div
                    key={item.id}
                    className='border border-gray-200 rounded-lg p-3 bg-gray-50'
                  >
                    <div className='font-medium text-gray-900'>{item.name}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </main>
  );
}
