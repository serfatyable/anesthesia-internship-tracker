'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/ui/cn';

interface RotationPageProps {
  params: {
    name: string;
  };
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
}

export default function RotationPage({ params }: RotationPageProps) {
  const { name } = params;
  const rotationName = decodeURIComponent(name);
  const [rotationData, setRotationData] = useState<RotationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for now - will be replaced with real data later
  const mockProcedures: ProcedureCategory[] = [
    {
      id: 'airway',
      name: 'Airway Management',
      procedures: [
        { id: 'intubation', name: 'Endotracheal Intubation', completed: false, pending: false },
        { id: 'lma', name: 'LMA Insertion', completed: false, pending: false },
        { id: 'mask-ventilation', name: 'Mask Ventilation', completed: true, pending: false },
        { id: 'bag-mask', name: 'Bag-Mask Ventilation', completed: false, pending: true },
      ],
    },
    {
      id: 'iv-access',
      name: 'IV Access',
      procedures: [
        { id: 'peripheral-iv', name: 'Peripheral IV Placement', completed: false, pending: false },
        { id: 'central-line', name: 'Central Line Placement', completed: false, pending: true },
        { id: 'arterial-line', name: 'Arterial Line Placement', completed: true, pending: false },
      ],
    },
    {
      id: 'induction',
      name: 'Induction & Maintenance',
      procedures: [
        { id: 'induction', name: 'General Anesthesia Induction', completed: false, pending: false },
        { id: 'emergence', name: 'Emergence from Anesthesia', completed: false, pending: false },
        { id: 'maintenance', name: 'Anesthesia Maintenance', completed: false, pending: false },
      ],
    },
    {
      id: 'monitoring',
      name: 'Patient Monitoring',
      procedures: [
        { id: 'hemodynamic', name: 'Hemodynamic Monitoring', completed: true, pending: false },
        { id: 'respiratory', name: 'Respiratory Monitoring', completed: false, pending: false },
      ],
    },
  ];

  const mockKnowledge: KnowledgeCategory[] = [
    {
      id: 'respiratory',
      name: 'Respiratory System',
      topics: [
        { id: 'bronchospasm', name: 'Bronchospasm Management', completed: false, pending: false },
        { id: 'asthma', name: 'Asthma Attack Treatment', completed: true, pending: false },
        { id: 'pneumonia', name: 'Post-op Pneumonia Prevention', completed: false, pending: true },
        { id: 'ventilation', name: 'Mechanical Ventilation', completed: false, pending: false },
      ],
    },
    {
      id: 'cardiovascular',
      name: 'Cardiovascular System',
      topics: [
        { id: 'hypotension', name: 'Hypotension Management', completed: false, pending: false },
        { id: 'arrhythmia', name: 'Arrhythmia Recognition', completed: false, pending: false },
        { id: 'shock', name: 'Shock Management', completed: true, pending: false },
      ],
    },
    {
      id: 'pharmacology',
      name: 'Anesthesia Pharmacology',
      topics: [
        { id: 'induction-agents', name: 'Induction Agents', completed: false, pending: false },
        {
          id: 'neuromuscular',
          name: 'Neuromuscular Blocking Agents',
          completed: false,
          pending: false,
        },
        { id: 'analgesics', name: 'Post-operative Analgesics', completed: false, pending: true },
      ],
    },
    {
      id: 'emergencies',
      name: 'Emergency Management',
      topics: [
        {
          id: 'malignant-hyperthermia',
          name: 'Malignant Hyperthermia',
          completed: false,
          pending: false,
        },
        { id: 'anaphylaxis', name: 'Anaphylaxis Management', completed: false, pending: false },
        {
          id: 'cardiac-arrest',
          name: 'Intraoperative Cardiac Arrest',
          completed: false,
          pending: false,
        },
      ],
    },
  ];

  const mockRotation = {
    name: rotationName,
    progress: 53,
    completed: 8,
    pending: 3,
    total: 15,
    state: 'ACTIVE' as const,
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setRotationData({
        rotation: mockRotation,
        procedures: mockProcedures,
        knowledge: mockKnowledge,
      });
      setLoading(false);
    }, 500);
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
    const topic = mockKnowledge
      .find((c) => c.id === categoryId)
      ?.topics.find((t) => t.id === topicId);
    alert(
      `Opening quiz for: ${topic?.name}\n\nThis will open the quiz interface in a future update.`,
    );
  };

  const toggleRotationState = () => {
    setRotationData((prev) => {
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
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!rotationData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Rotation Not Found</h2>
            <p className="text-gray-600">The requested rotation could not be found.</p>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { rotation, procedures, knowledge } = rotationData;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </Link>

          {/* Rotation Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{rotation.name}</h1>
              <button
                onClick={toggleRotationState}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  rotation.state === 'ACTIVE' && 'bg-blue-100 text-blue-800 hover:bg-blue-200',
                  rotation.state === 'FINISHED' && 'bg-green-100 text-green-800 hover:bg-green-200',
                  rotation.state === 'NOT_STARTED' && 'bg-gray-100 text-gray-800 hover:bg-gray-200',
                )}
              >
                {rotation.state === 'ACTIVE' && 'Active'}
                {rotation.state === 'FINISHED' && 'Finished'}
                {rotation.state === 'NOT_STARTED' && 'Not Started'}
              </button>
            </div>

            {/* Progress Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{rotation.progress}%</div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{rotation.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{rotation.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{rotation.total}</div>
                <div className="text-sm text-gray-600">Total Required</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${rotation.progress}%` }}
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Procedures Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Procedures</h2>
              <div className="space-y-4">
                {procedures.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{category.name}</h3>
                    <div className="space-y-2">
                      {category.procedures.map((procedure) => (
                        <button
                          key={procedure.id}
                          onClick={() => handleProcedureClick(category.id, procedure.id)}
                          className={cn(
                            'w-full text-left p-3 rounded-lg border transition-colors',
                            procedure.completed &&
                              procedure.pending &&
                              'bg-yellow-50 border-yellow-300 text-yellow-800',
                            procedure.completed &&
                              !procedure.pending &&
                              'bg-green-50 border-green-300 text-green-800',
                            !procedure.completed &&
                              'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{procedure.name}</span>
                            <span className="text-sm">
                              {procedure.completed && procedure.pending && 'Pending for approval'}
                              {procedure.completed && !procedure.pending && 'Completed'}
                              {!procedure.completed && 'Click to complete'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Knowledge</h2>
              <div className="space-y-4">
                {knowledge.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{category.name}</h3>
                    <div className="space-y-2">
                      {category.topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleKnowledgeClick(category.id, topic.id)}
                          className={cn(
                            'w-full text-left p-3 rounded-lg border transition-colors',
                            topic.completed &&
                              topic.pending &&
                              'bg-yellow-50 border-yellow-300 text-yellow-800',
                            topic.completed &&
                              !topic.pending &&
                              'bg-green-50 border-green-300 text-green-800',
                            !topic.completed &&
                              'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{topic.name}</span>
                            <span className="text-sm">
                              {topic.completed && topic.pending && 'Pending for approval'}
                              {topic.completed && !topic.pending && 'Completed'}
                              {!topic.completed && 'Take test'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
