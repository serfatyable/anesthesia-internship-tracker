import { RotationGroups } from '@/components/site/dashboard/RotationGroups';
import { RotationProgress } from '@/lib/domain/progress';

// Mock data to demonstrate the new rotation layout - realistic with 60 interns total
const mockRotations: RotationProgress[] = [
  {
    rotationId: '1',
    rotationName: 'ICU',
    required: 30,
    verified: 30,
    pending: 0,
    completionPercentage: 100,
    state: 'FINISHED',
    currentInterns: 0,
  },
  {
    rotationId: '2',
    rotationName: 'PACU',
    required: 25,
    verified: 25,
    pending: 0,
    completionPercentage: 100,
    state: 'FINISHED',
    currentInterns: 0,
  },
  {
    rotationId: '3',
    rotationName: 'OR',
    required: 35,
    verified: 20,
    pending: 8,
    completionPercentage: 57,
    state: 'ACTIVE',
    currentInterns: 12,
  },
  {
    rotationId: '4',
    rotationName: 'OB',
    required: 15,
    verified: 8,
    pending: 3,
    completionPercentage: 53,
    state: 'ACTIVE',
    currentInterns: 8,
  },
  {
    rotationId: '5',
    rotationName: 'Pain',
    required: 10,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
    currentInterns: 0,
  },
  {
    rotationId: '6',
    rotationName: 'Pediatric',
    required: 20,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
    currentInterns: 0,
  },
  {
    rotationId: '7',
    rotationName: 'Cardiac',
    required: 25,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
    currentInterns: 0,
  },
  {
    rotationId: '8',
    rotationName: 'Neuro',
    required: 18,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
    currentInterns: 0,
  },
  {
    rotationId: '9',
    rotationName: 'Regional',
    required: 22,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
    currentInterns: 0,
  },
  {
    rotationId: '10',
    rotationName: 'Emergency',
    required: 28,
    verified: 0,
    pending: 0,
    completionPercentage: 0,
    state: 'NOT_STARTED',
    currentInterns: 0,
  },
];

export default function TestRotationsPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            New Rotation Layout Demo
          </h1>
          <p className='text-gray-600'>
            This page demonstrates the new collapsible rotation groups with
            unique background colors and hover effects.
          </p>
        </div>

        <RotationGroups rotations={mockRotations} />

        <div className='mt-12 p-6 bg-white rounded-lg border border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Features Demonstrated:
          </h2>
          <ul className='space-y-2 text-gray-600'>
            <li>
              • <strong>Three Collapsible Groups:</strong> Currently Active, Not
              Yet Activated, Finished
            </li>
            <li>
              • <strong>Unique Background Colors:</strong> Each rotation has its
              own distinct color theme
            </li>
            <li>
              • <strong>Hover Effects:</strong> Cards glow with their unique
              border color and scale up on hover
            </li>
            <li>
              • <strong>Smooth Animations:</strong> All transitions are smooth
              and polished
            </li>
            <li>
              • <strong>Visual Separators:</strong> Thin bars separate each
              group
            </li>
            <li>
              • <strong>Rotation Counters:</strong> Each group shows how many
              rotations it contains
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
