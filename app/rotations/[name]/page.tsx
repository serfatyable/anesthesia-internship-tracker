'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/ui/cn';
// Removed unused import
import { ReflectionPanel } from '@/components/ReflectionPanel';
import { FeedbackCard } from '@/components/ui/FeedbackCard';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { MillersReferenceButton } from '@/components/ui/MillersReferenceButton';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { ResourcesCard } from '@/components/site/dashboard/ResourcesCard';

interface RotationPageProps {
  params: Promise<{
    name: string;
  }>;
}

interface RotationData {
  rotation: {
    name: string;
    progress: number;
    completed: number;
    pending: number;
    total: number;
    state: 'NOT_STARTED' | 'ACTIVE' | 'FINISHED';
  };
  procedures: ProcedureCategory[];
  knowledge: KnowledgeCategory[];
}

interface ProcedureCategory {
  id: string;
  name: string;
  procedures: ProcedureItem[];
}

interface ProcedureItem {
  id: string;
  name: string;
  completed: boolean;
  pending: boolean;
  textbookResource?: string;
}

interface KnowledgeCategory {
  id: string;
  name: string;
  topics: KnowledgeTopic[];
}

interface KnowledgeTopic {
  id: string;
  name: string;
  completed: boolean;
  pending: boolean;
  textbookResource?: string;
}

export default function RotationPage({ params }: RotationPageProps) {
  const [rotationName, setRotationName] = useState<string>('');

  useEffect(() => {
    params.then(resolvedParams => {
      setRotationName(decodeURIComponent(resolvedParams.name));
    });
  }, [params]);
  const [rotationData, setRotationData] = useState<RotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [proceduresExpanded, setProceduresExpanded] = useState(false);
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedProcedures, setExpandedProcedures] = useState<Set<string>>(
    new Set()
  );
  const [expandedKnowledge, setExpandedKnowledge] = useState<Set<string>>(
    new Set()
  );
  const [reflectionPanel, setReflectionPanel] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: 'PROCEDURE' | 'KNOWLEDGE';
    itemName: string;
    initialContent?: string;
    initialImages?: string[];
  }>({
    isOpen: false,
    itemId: '',
    itemType: 'PROCEDURE',
    itemName: '',
  });
  const [quizResults] = useState<
    Record<string, { passed: boolean; score: number }>
  >({});
  const [reflections, setReflections] = useState<
    Record<string, { content: string; images: string[] }>
  >({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [feedbackNotifications, setFeedbackNotifications] = useState<
    Record<string, number>
  >({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: string;
  }>({ isOpen: false, itemId: '', itemType: '' });

  // Mock data for now - will be replaced with real data later
  const mockProcedures: ProcedureCategory[] = useMemo(
    () => [
      {
        id: 'airway',
        name: 'Airway Management',
        procedures: [
          {
            id: 'intubation',
            name: 'Endotracheal Intubation',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Airway Management",
          },
          {
            id: 'lma',
            name: 'LMA Insertion',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Supraglottic Airways",
          },
          {
            id: 'mask-ventilation',
            name: 'Mask Ventilation',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Mask Ventilation",
          },
          {
            id: 'bag-mask',
            name: 'Bag-Mask Ventilation',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Bag-Mask Ventilation",
          },
        ],
      },
      {
        id: 'iv-access',
        name: 'IV Access',
        procedures: [
          {
            id: 'peripheral-iv',
            name: 'Peripheral IV Placement',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 20, Peripheral Venous Access",
          },
          {
            id: 'central-line',
            name: 'Central Line Placement',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 20, Central Venous Access",
          },
          {
            id: 'arterial-line',
            name: 'Arterial Line Placement',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 20, Arterial Access",
          },
        ],
      },
      {
        id: 'induction',
        name: 'Induction & Maintenance',
        procedures: [
          {
            id: 'induction',
            name: 'General Anesthesia Induction',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 13, Induction of Anesthesia",
          },
          {
            id: 'emergence',
            name: 'Emergence from Anesthesia',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 13, Emergence from Anesthesia",
          },
          {
            id: 'maintenance',
            name: 'Anesthesia Maintenance',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 13, Maintenance of Anesthesia",
          },
        ],
      },
      {
        id: 'monitoring',
        name: 'Patient Monitoring',
        procedures: [
          {
            id: 'hemodynamic',
            name: 'Hemodynamic Monitoring',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 20, Hemodynamic Monitoring",
          },
          {
            id: 'respiratory',
            name: 'Respiratory Monitoring',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 20, Respiratory Monitoring",
          },
        ],
      },
    ],
    []
  );

  const mockKnowledge: KnowledgeCategory[] = useMemo(
    () => [
      {
        id: 'respiratory',
        name: 'Respiratory System',
        topics: [
          {
            id: 'bronchospasm',
            name: 'Bronchospasm Management',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Respiratory Effects of Inhaled Anesthetics",
          },
          {
            id: 'asthma',
            name: 'Asthma Attack Treatment',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Asthma and COPD",
          },
          {
            id: 'pneumonia',
            name: 'Post-op Pneumonia Prevention',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Postoperative Pulmonary Complications",
          },
          {
            id: 'ventilation',
            name: 'Mechanical Ventilation',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Mechanical Ventilation",
          },
        ],
      },
      {
        id: 'cardiovascular',
        name: 'Cardiovascular System',
        topics: [
          {
            id: 'hypotension',
            name: 'Hypotension Management',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 18, Cardiovascular Effects of Anesthetics",
          },
          {
            id: 'arrhythmia',
            name: 'Arrhythmia Recognition',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 18, Cardiac Arrhythmias",
          },
          {
            id: 'shock',
            name: 'Shock Management',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 18, Shock and Hemodynamic Instability",
          },
        ],
      },
      {
        id: 'pharmacology',
        name: 'Anesthesia Pharmacology',
        topics: [
          {
            id: 'induction-agents',
            name: 'Induction Agents',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 11, Intravenous Anesthetics",
          },
          {
            id: 'neuromuscular',
            name: 'Neuromuscular Blocking Agents',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 12, Neuromuscular Blocking Agents",
          },
          {
            id: 'analgesics',
            name: 'Post-operative Analgesics',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 11, Opioid Analgesics",
          },
        ],
      },
      {
        id: 'emergencies',
        name: 'Emergency Management',
        topics: [
          {
            id: 'malignant-hyperthermia',
            name: 'Malignant Hyperthermia',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 16, Malignant Hyperthermia",
          },
          {
            id: 'anaphylaxis',
            name: 'Anaphylaxis Management',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 16, Anaphylaxis and Allergic Reactions",
          },
          {
            id: 'cardiac-arrest',
            name: 'Intraoperative Cardiac Arrest',
            completed: true,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 16, Cardiac Arrest and Resuscitation",
          },
        ],
      },
    ],
    []
  );

  const mockRotation = useMemo(
    () => ({
      name: rotationName,
      progress: 53,
      completed: 8,
      pending: 3,
      total: 15,
      state: 'ACTIVE' as const,
    }),
    [rotationName]
  );

  // Load favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch('/api/procedure-knowledge-favorites');
        if (response.ok) {
          const favoritesData = (await response.json()) as Array<{
            itemId: string;
            itemType: string;
          }>;
          const favoritesSet = new Set(
            favoritesData.map(fav => `${fav.itemId}-${fav.itemType}`)
          );
          setFavorites(favoritesSet);
        } else {
          console.error('Error loading favorites:', response.status);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  // Load feedback notifications on component mount
  useEffect(() => {
    const loadFeedbackNotifications = async () => {
      try {
        const response = await fetch('/api/mentor-feedback/notifications');
        if (response.ok) {
          const notificationsData = await response.json();
          const notificationsMap: Record<string, number> = {};
          notificationsData.itemNotifications.forEach(
            (item: {
              itemId: string;
              itemType: string;
              unreadCount: number;
            }) => {
              notificationsMap[`${item.itemId}-${item.itemType}`] =
                item.unreadCount;
            }
          );
          setFeedbackNotifications(notificationsMap);
        } else {
          console.error(
            'Error loading feedback notifications:',
            response.status
          );
        }
      } catch (error) {
        console.error('Error loading feedback notifications:', error);
      }
    };

    loadFeedbackNotifications();
  }, []);

  useEffect(() => {
    if (!rotationName) return;

    // Simulate loading
    const loadingTimer = setTimeout(() => {
      setRotationData({
        rotation: { ...mockRotation, name: rotationName },
        procedures: mockProcedures,
        knowledge: mockKnowledge,
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(loadingTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationName]);

  // Removed unused handleProcedureClick function

  const handleQuizClick = useCallback(
    (itemId: string, itemType: 'PROCEDURE' | 'KNOWLEDGE') => {
      // Open quiz in new tab
      window.open(`/quiz/${itemId}?type=${itemType}`, '_blank');
    },
    []
  );

  const handleReflectionClick = useCallback(
    (itemId: string, itemType: 'PROCEDURE' | 'KNOWLEDGE', itemName: string) => {
      const existingReflection = reflections[itemId];
      setReflectionPanel({
        isOpen: true,
        itemId,
        itemType,
        itemName,
        initialContent: existingReflection?.content || '',
        initialImages: existingReflection?.images || [],
      });
    },
    [reflections]
  );

  const handleSaveReflection = useCallback(
    async (content: string, images: string[]) => {
      try {
        const response = await fetch('/api/reflections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId: reflectionPanel.itemId,
            itemType: reflectionPanel.itemType,
            content,
            image1Url: images[0] || null,
            image2Url: images[1] || null,
          }),
        });

        if (response.ok) {
          setReflections(prev => ({
            ...prev,
            [reflectionPanel.itemId]: { content, images },
          }));
        } else {
          alert('Error saving reflection');
        }
      } catch (error) {
        console.error('Error saving reflection:', error);
        alert('Error saving reflection');
      }
    },
    [reflectionPanel.itemId, reflectionPanel.itemType]
  );

  const getQuizStatus = useCallback(
    (itemId: string): 'passed' | 'failed' | 'not-attempted' => {
      const result = quizResults[itemId];
      if (!result) return 'not-attempted';
      return result.passed ? 'passed' : 'failed';
    },
    [quizResults]
  );

  const getReflectionStatus = useCallback(
    (itemId: string): 'submitted' | 'not-submitted' => {
      const reflection = reflections[itemId];
      return reflection?.content ? 'submitted' : 'not-submitted';
    },
    [reflections]
  );

  // Removed unused handleKnowledgeClick function

  const toggleRotationState = useCallback(() => {
    setRotationData(prev => {
      if (!prev) return null;

      const states = ['NOT_STARTED', 'ACTIVE', 'FINISHED'] as const;
      const currentIndex = states.indexOf(prev.rotation.state || 'NOT_STARTED');
      const nextIndex = (currentIndex + 1) % states.length;

      return {
        ...prev,
        rotation: {
          ...prev.rotation,
          state: states[nextIndex] as 'NOT_STARTED' | 'ACTIVE' | 'FINISHED',
        },
      };
    });
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const toggleProcedure = useCallback((procedureId: string) => {
    setExpandedProcedures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(procedureId)) {
        newSet.delete(procedureId);
      } else {
        newSet.add(procedureId);
      }
      return newSet;
    });
  }, []);

  const toggleKnowledge = useCallback((topicId: string) => {
    setExpandedKnowledge(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  }, []);

  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(
    new Set()
  );

  const handleFavoriteToggle = useCallback(
    async (itemId: string, itemType: 'PROCEDURE' | 'KNOWLEDGE') => {
      const favoriteKey = `${itemId}-${itemType}`;

      // Prevent multiple simultaneous requests for the same item
      if (favoriteLoading.has(favoriteKey)) {
        return;
      }

      setFavoriteLoading(prev => new Set(prev).add(favoriteKey));

      try {
        const isCurrentlyFavorited = favorites.has(favoriteKey);
        const method = isCurrentlyFavorited ? 'DELETE' : 'POST';

        const response = await fetch('/api/procedure-knowledge-favorites', {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, itemType }),
        });

        if (response.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            if (isCurrentlyFavorited) {
              newSet.delete(favoriteKey);
            } else {
              newSet.add(favoriteKey);
            }
            return newSet;
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Favorite toggle error:', errorData);
          alert(
            `Error ${isCurrentlyFavorited ? 'removing from' : 'adding to'} favorites`
          );
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Network error - please try again');
      } finally {
        setFavoriteLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(favoriteKey);
          return newSet;
        });
      }
    },
    [favorites, favoriteLoading]
  );

  const handleFeedbackClick = useCallback(
    (itemId: string, itemType: string) => {
      setFeedbackModalOpen({
        isOpen: true,
        itemId,
        itemType,
      });
    },
    []
  );

  if (loading) {
    return <LoadingPage text='Loading rotation...' />;
  }

  if (!rotationData) {
    return (
      <main className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='text-center py-12'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Rotation Not Found
            </h2>
            <p className='text-gray-600'>
              The requested rotation could not be found.
            </p>
            <Link
              href='/dashboard'
              className='text-blue-600 hover:text-blue-700 mt-4 inline-block'
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { rotation, procedures, knowledge } = rotationData;

  return (
    <main className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='space-y-6'>
          {/* Back Button */}
          <Link
            href='/dashboard'
            className='inline-flex items-center text-blue-600 hover:text-blue-700 font-medium'
          >
            ← Back to Dashboard
          </Link>

          {/* Rotation Header */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h1 className='text-3xl font-bold text-gray-900'>
                {rotation.name}
              </h1>
              <button
                onClick={toggleRotationState}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  rotation.state === 'ACTIVE' &&
                    'bg-blue-100 text-blue-800 hover:bg-blue-200',
                  rotation.state === 'FINISHED' &&
                    'bg-green-100 text-green-800 hover:bg-green-200',
                  rotation.state === 'NOT_STARTED' &&
                    'bg-gray-100 text-gray-800 hover:bg-gray-200'
                )}
              >
                {rotation.state === 'ACTIVE' && 'Active'}
                {rotation.state === 'FINISHED' && 'Finished'}
                {rotation.state === 'NOT_STARTED' && 'Not Started'}
              </button>
            </div>

            {/* Progress Information */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900'>
                  {rotation.progress}%
                </div>
                <div className='text-sm text-gray-600'>Overall Progress</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {rotation.completed}
                </div>
                <div className='text-sm text-gray-600'>Completed</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {rotation.pending}
                </div>
                <div className='text-sm text-gray-600'>Pending</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-600'>
                  {rotation.total}
                </div>
                <div className='text-sm text-gray-600'>Total Required</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='w-full bg-gray-200 rounded-full h-4'>
              <div
                className='bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300'
                style={{ width: `${rotation.progress}%` }}
              />
            </div>
          </div>

          {/* Collapsible Cards Layout */}
          <div className='space-y-6'>
            {/* Procedures Card */}
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <button
                onClick={() => setProceduresExpanded(!proceduresExpanded)}
                className='w-full p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Procedures
                    </h2>
                    <span className='bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full'>
                      {procedures.reduce(
                        (total, category) => total + category.procedures.length,
                        0
                      )}{' '}
                      items
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-500'>
                      {proceduresExpanded
                        ? 'Click to collapse'
                        : 'Click to expand'}
                    </span>
                    <svg
                      className={cn(
                        'w-5 h-5 text-gray-400 transition-transform duration-200',
                        proceduresExpanded && 'rotate-180'
                      )}
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
                  </div>
                </div>
              </button>

              {proceduresExpanded && (
                <div className='border-t border-gray-200 p-6'>
                  <div className='space-y-4'>
                    {procedures.map(category => {
                      const isExpanded = expandedCategories.has(category.id);
                      return (
                        <div
                          key={category.id}
                          className='border border-gray-200 rounded-lg overflow-hidden'
                        >
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className='w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-3'>
                                <h3 className='font-medium text-gray-900'>
                                  {category.name}
                                </h3>
                                <span className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full'>
                                  {category.procedures.length} procedures
                                </span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <span className='text-xs text-gray-500'>
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </span>
                                <svg
                                  className={cn(
                                    'w-4 h-4 text-gray-400 transition-transform duration-200',
                                    isExpanded && 'rotate-180'
                                  )}
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
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className='border-t border-gray-200 p-4 bg-gray-50'>
                              <div className='space-y-2'>
                                {category.procedures.map(procedure => {
                                  const isExpanded = expandedProcedures.has(
                                    procedure.id
                                  );
                                  return (
                                    <div
                                      key={procedure.id}
                                      className={cn(
                                        'w-full rounded-lg border transition-colors',
                                        procedure.completed &&
                                          procedure.pending &&
                                          'bg-yellow-50 border-yellow-300 text-yellow-800',
                                        procedure.completed &&
                                          !procedure.pending &&
                                          'bg-green-50 border-green-300 text-green-800',
                                        !procedure.completed &&
                                          'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                                      )}
                                    >
                                      {/* Procedure Header */}
                                      <div className='p-3 flex items-center justify-between'>
                                        <button
                                          onClick={() =>
                                            toggleProcedure(procedure.id)
                                          }
                                          className='flex-1 text-left'
                                        >
                                          <div className='flex items-center justify-between'>
                                            <div className='flex-1'>
                                              <div className='flex items-center gap-2 mb-1'>
                                                <span className='font-medium'>
                                                  {procedure.name}
                                                </span>
                                                <MillersReferenceButton
                                                  title={procedure.name}
                                                  reference={
                                                    procedure.textbookResource ||
                                                    null
                                                  }
                                                />
                                              </div>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                              <span className='text-sm'>
                                                {procedure.completed &&
                                                  procedure.pending &&
                                                  'Pending for approval'}
                                                {procedure.completed &&
                                                  !procedure.pending &&
                                                  'Completed'}
                                                {!procedure.completed &&
                                                  'Click to complete'}
                                              </span>
                                              <svg
                                                className={cn(
                                                  'w-4 h-4 transition-transform duration-200',
                                                  isExpanded
                                                    ? 'rotate-180'
                                                    : 'rotate-0'
                                                )}
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
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={e => {
                                            e.stopPropagation();
                                            handleFavoriteToggle(
                                              procedure.id,
                                              'PROCEDURE'
                                            );
                                          }}
                                          disabled={favoriteLoading.has(
                                            `${procedure.id}-PROCEDURE`
                                          )}
                                          className='ml-2 p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                          title={
                                            favoriteLoading.has(
                                              `${procedure.id}-PROCEDURE`
                                            )
                                              ? 'Updating...'
                                              : favorites.has(
                                                    `${procedure.id}-PROCEDURE`
                                                  )
                                                ? 'Remove from favorites'
                                                : 'Add to favorites'
                                          }
                                        >
                                          {favoriteLoading.has(
                                            `${procedure.id}-PROCEDURE`
                                          ) ? (
                                            <svg
                                              className='w-5 h-5 text-gray-400 animate-spin'
                                              fill='none'
                                              stroke='currentColor'
                                              viewBox='0 0 24 24'
                                            >
                                              <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                              />
                                            </svg>
                                          ) : (
                                            <svg
                                              className={cn(
                                                'w-5 h-5 transition-colors',
                                                favorites.has(
                                                  `${procedure.id}-PROCEDURE`
                                                )
                                                  ? 'text-yellow-500 fill-current'
                                                  : 'text-gray-400 hover:text-yellow-500'
                                              )}
                                              fill='currentColor'
                                              viewBox='0 0 20 20'
                                            >
                                              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                            </svg>
                                          )}
                                        </button>
                                      </div>

                                      {/* Procedure Options Cards */}
                                      {isExpanded && (
                                        <div className='border-t border-gray-200 p-3 bg-gray-50'>
                                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                                            {/* Quiz Card */}
                                            <button
                                              onClick={() =>
                                                handleQuizClick(
                                                  procedure.id,
                                                  'PROCEDURE'
                                                )
                                              }
                                              className={cn(
                                                'p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105',
                                                getQuizStatus(procedure.id) ===
                                                  'passed' &&
                                                  'border-green-300 bg-green-50 hover:bg-green-100',
                                                getQuizStatus(procedure.id) ===
                                                  'failed' &&
                                                  'border-red-300 bg-red-50 hover:bg-red-100',
                                                getQuizStatus(procedure.id) ===
                                                  'not-attempted' &&
                                                  'border-gray-300 bg-white hover:bg-gray-50'
                                              )}
                                            >
                                              <div className='flex items-center space-x-3'>
                                                <div
                                                  className={cn(
                                                    'w-10 h-10 rounded-full flex items-center justify-center',
                                                    getQuizStatus(
                                                      procedure.id
                                                    ) === 'passed' &&
                                                      'bg-green-100',
                                                    getQuizStatus(
                                                      procedure.id
                                                    ) === 'failed' &&
                                                      'bg-red-100',
                                                    getQuizStatus(
                                                      procedure.id
                                                    ) === 'not-attempted' &&
                                                      'bg-gray-100'
                                                  )}
                                                >
                                                  <svg
                                                    className={cn(
                                                      'w-5 h-5',
                                                      getQuizStatus(
                                                        procedure.id
                                                      ) === 'passed' &&
                                                        'text-green-600',
                                                      getQuizStatus(
                                                        procedure.id
                                                      ) === 'failed' &&
                                                        'text-red-600',
                                                      getQuizStatus(
                                                        procedure.id
                                                      ) === 'not-attempted' &&
                                                        'text-gray-600'
                                                    )}
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                  >
                                                    <path
                                                      strokeLinecap='round'
                                                      strokeLinejoin='round'
                                                      strokeWidth={2}
                                                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                                    />
                                                  </svg>
                                                </div>
                                                <div className='text-left'>
                                                  <h4 className='font-medium text-gray-900'>
                                                    Take Quiz
                                                  </h4>
                                                  <p className='text-sm text-gray-600'>
                                                    {getQuizStatus(
                                                      procedure.id
                                                    ) === 'passed' &&
                                                      'Quiz passed - Click to retake'}
                                                    {getQuizStatus(
                                                      procedure.id
                                                    ) === 'failed' &&
                                                      'Quiz failed - Click to retake'}
                                                    {getQuizStatus(
                                                      procedure.id
                                                    ) === 'not-attempted' &&
                                                      'Test your knowledge'}
                                                  </p>
                                                </div>
                                              </div>
                                            </button>

                                            {/* Reflection Card */}
                                            <button
                                              onClick={() =>
                                                handleReflectionClick(
                                                  procedure.id,
                                                  'PROCEDURE',
                                                  procedure.name
                                                )
                                              }
                                              className={cn(
                                                'p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105',
                                                getReflectionStatus(
                                                  procedure.id
                                                ) === 'submitted' &&
                                                  'border-orange-300 bg-orange-50 hover:bg-orange-100',
                                                getReflectionStatus(
                                                  procedure.id
                                                ) === 'not-submitted' &&
                                                  'border-gray-300 bg-white hover:bg-gray-50'
                                              )}
                                            >
                                              <div className='flex items-center space-x-3'>
                                                <div
                                                  className={cn(
                                                    'w-10 h-10 rounded-full flex items-center justify-center',
                                                    getReflectionStatus(
                                                      procedure.id
                                                    ) === 'submitted' &&
                                                      'bg-orange-100',
                                                    getReflectionStatus(
                                                      procedure.id
                                                    ) === 'not-submitted' &&
                                                      'bg-gray-100'
                                                  )}
                                                >
                                                  <svg
                                                    className={cn(
                                                      'w-5 h-5',
                                                      getReflectionStatus(
                                                        procedure.id
                                                      ) === 'submitted' &&
                                                        'text-orange-600',
                                                      getReflectionStatus(
                                                        procedure.id
                                                      ) === 'not-submitted' &&
                                                        'text-gray-600'
                                                    )}
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                  >
                                                    <path
                                                      strokeLinecap='round'
                                                      strokeLinejoin='round'
                                                      strokeWidth={2}
                                                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                                    />
                                                  </svg>
                                                </div>
                                                <div className='text-left'>
                                                  <h4 className='font-medium text-gray-900'>
                                                    Write Reflection
                                                  </h4>
                                                  <p className='text-sm text-gray-600'>
                                                    {getReflectionStatus(
                                                      procedure.id
                                                    ) === 'submitted' &&
                                                      'Reflection submitted - Click to edit'}
                                                    {getReflectionStatus(
                                                      procedure.id
                                                    ) === 'not-submitted' &&
                                                      'Share your thoughts and learnings'}
                                                  </p>
                                                </div>
                                              </div>
                                            </button>

                                            {/* Feedback Card */}
                                            <FeedbackCard
                                              itemId={procedure.id}
                                              itemType='PROCEDURE'
                                              onFeedbackClick={
                                                handleFeedbackClick
                                              }
                                              unreadCount={
                                                feedbackNotifications[
                                                  `${procedure.id}-PROCEDURE`
                                                ] || 0
                                              }
                                              hasFeedback={
                                                (feedbackNotifications[
                                                  `${procedure.id}-PROCEDURE`
                                                ] || 0) > 0
                                              }
                                              disabled={!procedure.completed}
                                            />

                                            {/* Resources Card */}
                                            <ResourcesCard
                                              mode='item'
                                              itemId={procedure.id}
                                              itemType='PROCEDURE'
                                              itemName={procedure.name}
                                              {...(process.env
                                                .NEXT_PUBLIC_GOOGLE_DRIVE_URL && {
                                                driveUrl:
                                                  process.env
                                                    .NEXT_PUBLIC_GOOGLE_DRIVE_URL,
                                              })}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Knowledge Card */}
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <button
                onClick={() => setKnowledgeExpanded(!knowledgeExpanded)}
                className='w-full p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Knowledge
                    </h2>
                    <span className='bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full'>
                      {knowledge.reduce(
                        (total, category) => total + category.topics.length,
                        0
                      )}{' '}
                      topics
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-500'>
                      {knowledgeExpanded
                        ? 'Click to collapse'
                        : 'Click to expand'}
                    </span>
                    <svg
                      className={cn(
                        'w-5 h-5 text-gray-400 transition-transform duration-200',
                        knowledgeExpanded && 'rotate-180'
                      )}
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
                  </div>
                </div>
              </button>

              {knowledgeExpanded && (
                <div className='border-t border-gray-200 p-6'>
                  <div className='space-y-4'>
                    {knowledge.map(category => {
                      const isExpanded = expandedCategories.has(category.id);
                      return (
                        <div
                          key={category.id}
                          className='border border-gray-200 rounded-lg overflow-hidden'
                        >
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className='w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-3'>
                                <h3 className='font-medium text-gray-900'>
                                  {category.name}
                                </h3>
                                <span className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full'>
                                  {category.topics.length} topics
                                </span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <span className='text-xs text-gray-500'>
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </span>
                                <svg
                                  className={cn(
                                    'w-4 h-4 text-gray-400 transition-transform duration-200',
                                    isExpanded && 'rotate-180'
                                  )}
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
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className='border-t border-gray-200 p-4 bg-gray-50'>
                              <div className='space-y-2'>
                                {category.topics.map(topic => {
                                  const isExpanded = expandedKnowledge.has(
                                    topic.id
                                  );
                                  return (
                                    <div
                                      key={topic.id}
                                      className={cn(
                                        'w-full rounded-lg border transition-colors',
                                        topic.completed &&
                                          topic.pending &&
                                          'bg-yellow-50 border-yellow-300 text-yellow-800',
                                        topic.completed &&
                                          !topic.pending &&
                                          'bg-green-50 border-green-300 text-green-800',
                                        !topic.completed &&
                                          'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                                      )}
                                    >
                                      {/* Knowledge Topic Header */}
                                      <div className='p-3 flex items-center justify-between'>
                                        <button
                                          onClick={() =>
                                            toggleKnowledge(topic.id)
                                          }
                                          className='flex-1 text-left'
                                        >
                                          <div className='flex items-center justify-between'>
                                            <div className='flex-1'>
                                              <div className='flex items-center gap-2 mb-1'>
                                                <span className='font-medium'>
                                                  {topic.name}
                                                </span>
                                                <MillersReferenceButton
                                                  title={topic.name}
                                                  reference={
                                                    topic.textbookResource ||
                                                    null
                                                  }
                                                />
                                              </div>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                              <span className='text-sm'>
                                                {topic.completed &&
                                                  topic.pending &&
                                                  'Pending for approval'}
                                                {topic.completed &&
                                                  !topic.pending &&
                                                  'Completed'}
                                                {!topic.completed &&
                                                  'Take test'}
                                              </span>
                                              <svg
                                                className={cn(
                                                  'w-4 h-4 transition-transform duration-200',
                                                  isExpanded
                                                    ? 'rotate-180'
                                                    : 'rotate-0'
                                                )}
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
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={e => {
                                            e.stopPropagation();
                                            handleFavoriteToggle(
                                              topic.id,
                                              'KNOWLEDGE'
                                            );
                                          }}
                                          disabled={favoriteLoading.has(
                                            `${topic.id}-KNOWLEDGE`
                                          )}
                                          className='ml-2 p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                          title={
                                            favoriteLoading.has(
                                              `${topic.id}-KNOWLEDGE`
                                            )
                                              ? 'Updating...'
                                              : favorites.has(
                                                    `${topic.id}-KNOWLEDGE`
                                                  )
                                                ? 'Remove from favorites'
                                                : 'Add to favorites'
                                          }
                                        >
                                          {favoriteLoading.has(
                                            `${topic.id}-KNOWLEDGE`
                                          ) ? (
                                            <svg
                                              className='w-5 h-5 text-gray-400 animate-spin'
                                              fill='none'
                                              stroke='currentColor'
                                              viewBox='0 0 24 24'
                                            >
                                              <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                              />
                                            </svg>
                                          ) : (
                                            <svg
                                              className={cn(
                                                'w-5 h-5 transition-colors',
                                                favorites.has(
                                                  `${topic.id}-KNOWLEDGE`
                                                )
                                                  ? 'text-yellow-500 fill-current'
                                                  : 'text-gray-400 hover:text-yellow-500'
                                              )}
                                              fill='currentColor'
                                              viewBox='0 0 20 20'
                                            >
                                              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                            </svg>
                                          )}
                                        </button>
                                      </div>

                                      {/* Knowledge Topic Options Cards */}
                                      {isExpanded && (
                                        <div className='border-t border-gray-200 p-3 bg-gray-50'>
                                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                                            {/* Quiz Card */}
                                            <button
                                              onClick={() =>
                                                handleQuizClick(
                                                  topic.id,
                                                  'KNOWLEDGE'
                                                )
                                              }
                                              className={cn(
                                                'p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105',
                                                getQuizStatus(topic.id) ===
                                                  'passed' &&
                                                  'border-green-300 bg-green-50 hover:bg-green-100',
                                                getQuizStatus(topic.id) ===
                                                  'failed' &&
                                                  'border-red-300 bg-red-50 hover:bg-red-100',
                                                getQuizStatus(topic.id) ===
                                                  'not-attempted' &&
                                                  'border-gray-300 bg-white hover:bg-gray-50'
                                              )}
                                            >
                                              <div className='flex items-center space-x-3'>
                                                <div
                                                  className={cn(
                                                    'w-10 h-10 rounded-full flex items-center justify-center',
                                                    getQuizStatus(topic.id) ===
                                                      'passed' &&
                                                      'bg-green-100',
                                                    getQuizStatus(topic.id) ===
                                                      'failed' && 'bg-red-100',
                                                    getQuizStatus(topic.id) ===
                                                      'not-attempted' &&
                                                      'bg-gray-100'
                                                  )}
                                                >
                                                  <svg
                                                    className={cn(
                                                      'w-5 h-5',
                                                      getQuizStatus(
                                                        topic.id
                                                      ) === 'passed' &&
                                                        'text-green-600',
                                                      getQuizStatus(
                                                        topic.id
                                                      ) === 'failed' &&
                                                        'text-red-600',
                                                      getQuizStatus(
                                                        topic.id
                                                      ) === 'not-attempted' &&
                                                        'text-gray-600'
                                                    )}
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                  >
                                                    <path
                                                      strokeLinecap='round'
                                                      strokeLinejoin='round'
                                                      strokeWidth={2}
                                                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                                    />
                                                  </svg>
                                                </div>
                                                <div className='text-left'>
                                                  <h4 className='font-medium text-gray-900'>
                                                    Take Quiz
                                                  </h4>
                                                  <p className='text-sm text-gray-600'>
                                                    {getQuizStatus(topic.id) ===
                                                      'passed' &&
                                                      'Quiz passed - Click to retake'}
                                                    {getQuizStatus(topic.id) ===
                                                      'failed' &&
                                                      'Quiz failed - Click to retake'}
                                                    {getQuizStatus(topic.id) ===
                                                      'not-attempted' &&
                                                      'Test your knowledge'}
                                                  </p>
                                                </div>
                                              </div>
                                            </button>

                                            {/* Reflection Card */}
                                            <button
                                              onClick={() =>
                                                handleReflectionClick(
                                                  topic.id,
                                                  'KNOWLEDGE',
                                                  topic.name
                                                )
                                              }
                                              className={cn(
                                                'p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105',
                                                getReflectionStatus(
                                                  topic.id
                                                ) === 'submitted' &&
                                                  'border-orange-300 bg-orange-50 hover:bg-orange-100',
                                                getReflectionStatus(
                                                  topic.id
                                                ) === 'not-submitted' &&
                                                  'border-gray-300 bg-white hover:bg-gray-50'
                                              )}
                                            >
                                              <div className='flex items-center space-x-3'>
                                                <div
                                                  className={cn(
                                                    'w-10 h-10 rounded-full flex items-center justify-center',
                                                    getReflectionStatus(
                                                      topic.id
                                                    ) === 'submitted' &&
                                                      'bg-orange-100',
                                                    getReflectionStatus(
                                                      topic.id
                                                    ) === 'not-submitted' &&
                                                      'bg-gray-100'
                                                  )}
                                                >
                                                  <svg
                                                    className={cn(
                                                      'w-5 h-5',
                                                      getReflectionStatus(
                                                        topic.id
                                                      ) === 'submitted' &&
                                                        'text-orange-600',
                                                      getReflectionStatus(
                                                        topic.id
                                                      ) === 'not-submitted' &&
                                                        'text-gray-600'
                                                    )}
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                  >
                                                    <path
                                                      strokeLinecap='round'
                                                      strokeLinejoin='round'
                                                      strokeWidth={2}
                                                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                                    />
                                                  </svg>
                                                </div>
                                                <div className='text-left'>
                                                  <h4 className='font-medium text-gray-900'>
                                                    Write Reflection
                                                  </h4>
                                                  <p className='text-sm text-gray-600'>
                                                    {getReflectionStatus(
                                                      topic.id
                                                    ) === 'submitted' &&
                                                      'Reflection submitted - Click to edit'}
                                                    {getReflectionStatus(
                                                      topic.id
                                                    ) === 'not-submitted' &&
                                                      'Share your thoughts and learnings'}
                                                  </p>
                                                </div>
                                              </div>
                                            </button>

                                            {/* Feedback Card */}
                                            <FeedbackCard
                                              itemId={topic.id}
                                              itemType='KNOWLEDGE'
                                              onFeedbackClick={
                                                handleFeedbackClick
                                              }
                                              unreadCount={
                                                feedbackNotifications[
                                                  `${topic.id}-KNOWLEDGE`
                                                ] || 0
                                              }
                                              hasFeedback={
                                                (feedbackNotifications[
                                                  `${topic.id}-KNOWLEDGE`
                                                ] || 0) > 0
                                              }
                                              disabled={!topic.completed}
                                            />

                                            {/* Resources Card */}
                                            <ResourcesCard
                                              mode='item'
                                              itemId={topic.id}
                                              itemType='KNOWLEDGE'
                                              itemName={topic.name}
                                              {...(process.env
                                                .NEXT_PUBLIC_GOOGLE_DRIVE_URL && {
                                                driveUrl:
                                                  process.env
                                                    .NEXT_PUBLIC_GOOGLE_DRIVE_URL,
                                              })}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reflection Panel */}
      <ReflectionPanel
        isOpen={reflectionPanel.isOpen}
        onClose={() => setReflectionPanel(prev => ({ ...prev, isOpen: false }))}
        itemName={reflectionPanel.itemName}
        initialContent={reflectionPanel.initialContent || ''}
        initialImages={reflectionPanel.initialImages || []}
        onSave={handleSaveReflection}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen.isOpen}
        itemId={feedbackModalOpen.itemId}
        itemType={feedbackModalOpen.itemType}
        onClose={() =>
          setFeedbackModalOpen({ isOpen: false, itemId: '', itemType: '' })
        }
      />
    </main>
  );
}
