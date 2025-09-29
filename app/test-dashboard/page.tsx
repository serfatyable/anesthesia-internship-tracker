import { InternDashboard } from '@/components/site/dashboard/InternDashboard';
import { CardTile } from '@/components/site/CardTile';

// Mock data for testing - realistic with 60 interns total
const mockDashboard = {
  summary: {
    totalRequired: 120,
    totalVerified: 85,
    totalPending: 12,
    completionPercentage: 71,
  },
  rotations: [
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
      rotationName: 'Operating Room',
      required: 35,
      verified: 20,
      pending: 8,
      completionPercentage: 57,
      state: 'ACTIVE',
      currentInterns: 12,
    },
    {
      rotationId: '4',
      rotationName: 'OBGYN',
      required: 15,
      verified: 8,
      pending: 3,
      completionPercentage: 53,
      state: 'ACTIVE',
      currentInterns: 8,
    },
    {
      rotationId: '5',
      rotationName: 'Pain Management',
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
  ],
  pendingVerifications: [
    {
      id: '1',
      logEntryId: 'log1',
      procedureName: 'Arterial Line',
      internName: 'Test Intern',
      date: new Date(),
      count: 1,
      notes: 'Test procedure',
      createdAt: new Date(),
    },
  ],
  recentActivity: [
    {
      id: '1',
      type: 'LOG_CREATED' as const,
      description: 'Logged 2 Arterial Line',
      timestamp: new Date(),
      internName: 'You',
      procedureName: 'Arterial Line',
    },
    {
      id: '2',
      type: 'LOG_VERIFIED' as const,
      description: 'Central Line verified',
      timestamp: new Date(),
      internName: 'You',
      procedureName: 'Central Line',
    },
  ],
};

export default function TestDashboardPage() {
  return (
    <main className='p-6'>
      <section className='space-y-6'>
        <header>
          <h1 className='text-2xl font-semibold'>
            Test Dashboard - Styling Check
          </h1>
          <p className='text-sm text-zinc-500'>
            This page shows the dashboard styling without authentication
          </p>
        </header>

        {/* Main Dashboard Content */}
        <InternDashboard dashboard={mockDashboard} />

        {/* Quick Actions */}
        <div className='mt-8'>
          <h2 className='text-lg font-medium mb-4'>Quick Actions</h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <CardTile
              title='Log Procedures'
              href='/logs/new'
              desc='Add new procedure logs'
            />
            <CardTile
              title='View All Logs'
              href='/logs'
              desc='Browse your procedure history'
            />
            <CardTile
              title='Verify Queue'
              href='/verify'
              desc='Review pending verifications'
            />
            <CardTile
              title='Rotations'
              href='/rotations'
              desc='Browse rotation requirements'
            />
            <CardTile
              title='Settings'
              href='/admin'
              desc='Manage your account'
            />
          </div>
        </div>
      </section>
    </main>
  );
}
