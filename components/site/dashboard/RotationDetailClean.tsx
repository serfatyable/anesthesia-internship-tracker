'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import { RotationProgress } from '@/lib/domain/progress';
import { cn } from '@/lib/ui/cn';
import { mockProcedures } from '@/lib/data/mockProcedures';
import type { ProcedureCategory } from '@/lib/data/mockProcedures';

interface RotationDetailProps {
  rotationName: string;
  userId: string;
}

interface RotationData {
  rotation: RotationProgress;
  procedures: ProcedureCategory[];
  knowledge: KnowledgeCategory[];
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

export const RotationDetail = memo(function RotationDetail({ rotationName }: RotationDetailProps) {
  const [rotationData, setRotationData] = useState<RotationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Use mock data from external file - will be replaced with real API data later
  const procedures: ProcedureCategory[] = useMemo(() => mockProcedures, []);

  const mockKnowledge: KnowledgeCategory[] = useMemo(
    () => [
      {
        id: 'respiratory',
        name: 'Respiratory System',
        topics: [
          {
            id: 'bronchospasm',
            name: 'Bronchospasm Management',
            completed: false,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Respiratory Effects of Inhaled Anesthetics",
          },
          {
            id: 'asthma',
            name: 'Asthma Attack Treatment',
            completed: true,
            pending: false,
            textbookResource: "Miller's Anesthesia, 10th Edition, Chapter 19, Asthma and COPD",
          },
          {
            id: 'pneumonia',
            name: 'Post-op Pneumonia Prevention',
            completed: false,
            pending: true,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 19, Postoperative Pulmonary Complications",
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
            completed: false,
            pending: false,
            textbookResource:
              "Miller's Anesthesia, 10th Edition, Chapter 18, Cardiovascular Effects of Anesthetics",
          },
          {
            id: 'arrhythmia',
            name: 'Arrhythmia Recognition',
            completed: false,
            pending: false,
            textbookResource: "Miller's Anesthesia, 10th Edition, Chapter 18, Cardiac Arrhythmias",
          },
        ],
      },
    ],
    [],
  );

  const mockRotation: RotationProgress = useMemo(
    () => ({
      rotationId: '1',
      rotationName: rotationName,
      required: 15,
      verified: 8,
      pending: 3,
      completionPercentage: 53,
      state: 'ACTIVE',
    }),
    [rotationName],
  );

  useEffect(() => {
    // Simulate loading
    const loadingTimer = setTimeout(() => {
      setRotationData({
        rotation: mockRotation,
        procedures: procedures,
        knowledge: mockKnowledge,
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(loadingTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationName]);

  const handleProcedureClick = (categoryId: string, procedureId: string) => {
    setRotationData((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        procedures: prev.procedures.map((category) => {
          if (category.id === categoryId) {
            return {
              ...category,
              procedures: category.procedures.map((procedure) => {
                if (procedure.id === procedureId) {
                  return {
                    ...procedure,
                    completed: !procedure.completed,
                    pending: !procedure.completed, // If completing, mark as pending
                  };
                }
                return procedure;
              }),
            };
          }
          return category;
        }),
      };
    });
  };

  const handleKnowledgeClick = (categoryId: string, topicId: string) => {
    // For now, just open a placeholder for the quiz interface
    alert(
      `Opening quiz for: ${mockKnowledge.find((c) => c.id === categoryId)?.topics.find((t) => t.id === topicId)?.name}`,
    );
  };

  const toggleRotationState = () => {
    setRotationData((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        rotation: {
          ...prev.rotation,
          state: prev.rotation.state === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE',
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading rotation details...</span>
      </div>
    );
  }

  if (!rotationData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No rotation data available</p>
      </div>
    );
  }

  const { rotation, procedures: rotationProcedures, knowledge } = rotationData;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Rotation Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{rotation.rotationName}</h1>
            <p className="text-gray-600 mt-1">
              Progress: {rotation.verified}/{rotation.required} procedures completed
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                rotation.state === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800',
              )}
            >
              {rotation.state}
            </span>
            <button
              onClick={toggleRotationState}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {rotation.state === 'ACTIVE' ? 'Mark Complete' : 'Mark Active'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{rotation.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${rotation.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Procedures Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Procedures</h2>
        <div className="space-y-4">
          {rotationProcedures.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.procedures.map((procedure) => (
                  <div
                    key={procedure.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                      procedure.completed
                        ? 'bg-green-50 border-green-200'
                        : procedure.pending
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200',
                    )}
                    onClick={() => handleProcedureClick(category.id, procedure.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{procedure.name}</span>
                      <div className="flex items-center space-x-2">
                        {procedure.completed && <span className="text-green-600 text-sm">✓</span>}
                        {procedure.pending && <span className="text-yellow-600 text-sm">⏳</span>}
                      </div>
                    </div>
                    {procedure.textbookResource && (
                      <p className="text-xs text-gray-500 mt-1">{procedure.textbookResource}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Knowledge Topics</h2>
        <div className="space-y-4">
          {knowledge.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                      topic.completed
                        ? 'bg-green-50 border-green-200'
                        : topic.pending
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200',
                    )}
                    onClick={() => handleKnowledgeClick(category.id, topic.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{topic.name}</span>
                      <div className="flex items-center space-x-2">
                        {topic.completed && <span className="text-green-600 text-sm">✓</span>}
                        {topic.pending && <span className="text-yellow-600 text-sm">⏳</span>}
                      </div>
                    </div>
                    {topic.textbookResource && (
                      <p className="text-xs text-gray-500 mt-1">{topic.textbookResource}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <Link
          href="/rotations"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Back to Rotations
        </Link>
      </div>
    </div>
  );
});
