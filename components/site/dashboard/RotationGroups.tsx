'use client';

import { useState } from 'react';
import { RotationProgress } from '@/lib/domain/progress';
import { RotationCard } from './RotationCard';
import { cn } from '@/lib/ui/cn';

interface RotationGroupsProps {
  rotations: RotationProgress[];
  className?: string;
}

interface RotationGroup {
  title: string;
  rotations: RotationProgress[];
  isCollapsed: boolean;
  bgColor: string;
  borderColor: string;
}

export function RotationGroups({ rotations, className }: RotationGroupsProps) {
  const [groups, setGroups] = useState<RotationGroup[]>([
    {
      title: 'Currently Active',
      rotations: rotations.filter((r) => r.state === 'ACTIVE'),
      isCollapsed: false,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Not Yet Activated',
      rotations: rotations.filter((r) => r.state === 'NOT_STARTED'),
      isCollapsed: false,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    {
      title: 'Finished',
      rotations: rotations.filter((r) => r.state === 'FINISHED'),
      isCollapsed: false,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ]);

  const toggleGroup = (groupIndex: number) => {
    setGroups((prev) =>
      prev.map((group, index) =>
        index === groupIndex ? { ...group, isCollapsed: !group.isCollapsed } : group,
      ),
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {groups.map((group, groupIndex) => (
        <div key={group.title} className="space-y-3">
          {/* Group Header */}
          <div
            className={cn(
              'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200',
              group.bgColor,
              group.borderColor,
              'border hover:shadow-md',
            )}
            onClick={() => toggleGroup(groupIndex)}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
              <span className="px-2 py-1 text-xs font-medium bg-white rounded-full text-gray-600">
                {group.rotations.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className={cn(
                  'w-5 h-5 text-gray-500 transition-transform duration-200',
                  group.isCollapsed ? 'rotate-180' : '',
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Group Content */}
          {!group.isCollapsed && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.rotations.map((rotation) => (
                <RotationCard key={rotation.rotationId} rotation={rotation} />
              ))}
            </div>
          )}

          {/* Separator (except for last group) */}
          {groupIndex < groups.length - 1 && <div className="border-t border-gray-200 my-6"></div>}
        </div>
      ))}
    </div>
  );
}
