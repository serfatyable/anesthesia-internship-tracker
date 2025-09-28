'use client';

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/ui/cn';

interface FavoriteInternCardProps {
  intern: {
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
  };
  progress: {
    summary: {
      totalRequired: number;
      totalVerified: number;
      totalPending: number;
      completionPercentage: number;
    };
    rotations: Array<{
      rotationId: string;
      rotationName: string;
      required: number;
      verified: number;
      pending: number;
      completionPercentage: number;
      state: string;
    }>;
    pendingVerifications: Array<{
      id: string;
      procedureName: string;
      date: Date;
      count: number;
    }>;
  };
  className?: string;
}

export const FavoriteInternCard = memo(function FavoriteInternCard({
  intern,
  progress,
  className,
}: FavoriteInternCardProps) {
  const { summary, rotations, pendingVerifications } = progress;

  // Calculate days in specialty
  const daysInSpecialty = Math.floor(
    (new Date().getTime() - new Date(intern.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  // Find completed rotations (100% completion)
  const completedRotations = rotations.filter((r) => r.completionPercentage >= 100).length;

  // Find current active rotation
  const currentRotation = rotations.find((r) => r.state === 'ACTIVE');

  // Calculate tasks not yet performed (procedures with 0 logs)
  const tasksNotPerformed =
    summary.totalRequired - progress.summary.totalVerified - progress.summary.totalPending;

  return (
    <Link
      href={`/intern/${intern.id}`}
      className={cn(
        'block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105 group h-full',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {intern.name || 'Unknown Intern'}
          </h3>
          <p className="text-sm text-gray-500 truncate">{intern.email}</p>
        </div>
        <div className="ml-2">
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {summary.completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${summary.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{daysInSpecialty}</div>
          <div className="text-xs text-gray-500">Days in Specialty</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{completedRotations}</div>
          <div className="text-xs text-gray-500">Completed Rotations</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{summary.totalPending}</div>
          <div className="text-xs text-gray-500">Pending Approval</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{summary.totalVerified}</div>
          <div className="text-xs text-gray-500">Approved Tasks</div>
        </div>
      </div>

      {/* Current Rotation */}
      {currentRotation && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Current Rotation</span>
            <span className="text-sm font-semibold text-blue-600">
              {currentRotation.rotationName}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentRotation.completionPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currentRotation.verified} / {currentRotation.required} tasks
          </div>
        </div>
      )}

      {/* Tasks Not Yet Performed */}
      <div className="text-center">
        <div className="text-lg font-semibold text-red-600">{tasksNotPerformed}</div>
        <div className="text-xs text-gray-500">Tasks Not Yet Performed</div>
      </div>

      {/* Recent Pending Items Preview */}
      {pendingVerifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Recent Pending Items:</div>
          <div className="space-y-1">
            {pendingVerifications.slice(0, 2).map((item) => (
              <div key={item.id} className="text-xs text-gray-600 truncate">
                • {item.procedureName} ({item.count})
              </div>
            ))}
            {pendingVerifications.length > 2 && (
              <div className="text-xs text-gray-400">
                +{pendingVerifications.length - 2} more...
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
});
