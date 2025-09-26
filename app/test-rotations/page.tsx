import { RotationGroups } from '@/components/site/dashboard/RotationGroups';
import { RotationProgress } from '@/lib/domain/progress';

// Mock data to demonstrate the new rotation layout
const mockRotations: RotationProgress[] = [
  {
    rotationId: '1',
    rotationName: 'ICU',
    required: 15,
    verified: 12,
    pending: 3,
    completionPercentage: 80,
    state: 'ACTIVE',
  },
  {
    rotationId: '2',
    rotationName: 'PACU',
    required: 10,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
  },
  {
    rotationId: '3',
    rotationName: 'OR',
    required: 20,
    verified: 20,
    pending: 0,
    completionPercentage: 100,
    state: 'FINISHED',
  },
  {
    rotationId: '4',
    rotationName: 'OB',
    required: 8,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
  },
  {
    rotationId: '5',
    rotationName: 'Pain',
    required: 12,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
  },
  {
    rotationId: '6',
    rotationName: 'Pediatric',
    required: 15,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
  },
  {
    rotationId: '7',
    rotationName: 'Cardiac',
    required: 18,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
  },
  {
    rotationId: '8',
    rotationName: 'Neuro',
    required: 14,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
  },
  {
    rotationId: '9',
    rotationName: 'Regional',
    required: 16,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
  },
  {
    rotationId: '10',
    rotationName: 'Emergency',
    required: 22,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
  },
];

export default function TestRotationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Rotation Layout Demo</h1>
          <p className="text-gray-600">
            This page demonstrates the new collapsible rotation groups with unique background colors
            and hover effects.
          </p>
        </div>

        <RotationGroups rotations={mockRotations} />

        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features Demonstrated:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>
              • <strong>Three Collapsible Groups:</strong> Currently Active, Not Yet Activated,
              Finished
            </li>
            <li>
              • <strong>Unique Background Colors:</strong> Each rotation has its own distinct color
              theme
            </li>
            <li>
              • <strong>Hover Effects:</strong> Cards glow with their unique border color and scale
              up on hover
            </li>
            <li>
              • <strong>Smooth Animations:</strong> All transitions are smooth and polished
            </li>
            <li>
              • <strong>Visual Separators:</strong> Thin bars separate each group
            </li>
            <li>
              • <strong>Rotation Counters:</strong> Each group shows how many rotations it contains
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
