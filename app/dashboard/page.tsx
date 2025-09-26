import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { progressService } from '@/lib/services/progressService';
import { prisma } from '@/lib/db';
import { InternDashboard } from '@/components/site/dashboard/InternDashboard';
import { InternSelector } from '@/components/site/dashboard/InternSelector';
import { redirect } from 'next/navigation';
import { InternDashboard as InternDashboardType } from '@/lib/domain/progress';

type ExtendedInternDashboard = InternDashboardType & {
  selectedInternId?: string;
  selectedInternName?: string;
};

interface DashboardPageProps {
  searchParams: {
    internId?: string;
  };
}

async function DashboardContent({ searchParams }: { searchParams: { internId?: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { user } = session;
  const { internId } = searchParams;

  // Determine if user is a tutor/admin
  const isTutor = user.role === 'TUTOR' || user.role === 'ADMIN';

  try {
    let dashboardData: ExtendedInternDashboard;
    let interns: Array<{ id: string; name: string | null; email: string }> = [];

    if (isTutor) {
      // For tutors, get progress for selected intern or first intern
      const targetInternId =
        internId || (await prisma.user.findFirst({ where: { role: 'INTERN' } }))?.id;
      if (!targetInternId) {
        throw new Error('No interns found');
      }

      const progress = await progressService.getInternProgress(targetInternId);
      const selectedIntern = await prisma.user.findUnique({
        where: { id: targetInternId },
        select: { id: true, name: true },
      });

      dashboardData = {
        ...progress,
        selectedInternId: targetInternId,
        selectedInternName: selectedIntern?.name || 'Unknown',
      };

      interns = await prisma.user.findMany({
        where: { role: 'INTERN' },
        select: { id: true, name: true, email: true },
      });
    } else {
      // For interns, get their own progress
      dashboardData = await progressService.getInternProgress(user.id);
    }

    return (
      <main className="max-w-5xl mx-auto p-4">
        <section className="space-y-6">
          {/* Intern Selector for Tutors */}
          {isTutor && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-medium mb-3">Select Intern</h2>
              <InternSelector
                interns={interns}
                selectedInternId={dashboardData.selectedInternId || undefined}
              />
              {dashboardData.selectedInternName && (
                <p className="text-sm text-gray-600 mt-2">
                  Viewing progress for:{' '}
                  <span className="font-medium">{dashboardData.selectedInternName}</span>
                </p>
              )}
            </div>
          )}

          {/* Main Dashboard Content */}
          <InternDashboard dashboard={dashboardData} />
        </section>
      </main>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <main className="max-w-5xl mx-auto p-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">
            {error instanceof Error
              ? error.message
              : 'An error occurred while loading the dashboard'}
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
            <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
              {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </main>
    );
  }
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <Suspense
      fallback={
        <main className="max-w-5xl mx-auto p-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      }
    >
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
