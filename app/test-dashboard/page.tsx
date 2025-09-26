import { InternDashboard } from '@/components/site/dashboard/InternDashboard';
import { CardTile } from '@/components/site/CardTile';

// Mock data for testing
const mockDashboard = {
  summary: {
    totalRequired: 50,
    totalVerified: 35,
    totalPending: 8,
    completionPercentage: 70,
  },
  rotations: [
    {
      rotationId: '1',
      rotationName: 'ICU',
      required: 25,
      verified: 20,
      pending: 3,
      completionPercentage: 80,
      state: 'ACTIVE',
    },
    {
      rotationId: '2',
      rotationName: 'PACU',
      required: 15,
      verified: 10,
      pending: 2,
      completionPercentage: 67,
      state: 'ACTIVE',
    },
    {
      rotationId: '3',
      rotationName: 'Operating Room',
      required: 10,
      verified: 5,
      pending: 3,
      completionPercentage: 50,
      state: 'NOT_STARTED',
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
    <main className="p-6">
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Test Dashboard - Styling Check</h1>
          <p className="text-sm text-zinc-500">
            This page shows the dashboard styling without authentication
          </p>
        </header>

        {/* Main Dashboard Content */}
        <InternDashboard dashboard={mockDashboard} />

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardTile title="Log Procedures" href="/logs/new" desc="Add new procedure logs" />
            <CardTile title="View All Logs" href="/logs" desc="Browse your procedure history" />
            <CardTile title="Verify Queue" href="/verify" desc="Review pending verifications" />
            <CardTile title="Rotations" href="/rotations" desc="Browse rotation requirements" />
            <CardTile title="Settings" href="/admin" desc="Manage your account" />
          </div>
        </div>
      </section>
    </main>
  );
}
