import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { progressService } from '@/lib/services/progressService';
import { prisma } from '@/lib/db';
import DashboardClient from './DashboardClient';
import { InternDashboard as InternDashboardType } from '@/lib/domain/progress';

// Remove useSearchParams import

type ExtendedInternDashboard = InternDashboardType & {
  selectedInternId?: string;
  selectedInternName?: string;
};

interface DashboardPageProps {
  searchParams: Promise<{
    internId?: string;
    internPage?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const { user } = session;
  const params = await searchParams;
  // Pagination for tutors
  const isTutor = user.role === 'TUTOR' || user.role === 'ADMIN';
  let page = 1;
  const limit = 20;
  if (params && params.internPage) {
    const parsed = parseInt(params.internPage, 10);
    if (!isNaN(parsed) && parsed > 0) page = parsed;
  }
  const offset = (page - 1) * limit;

  let dashboardData: ExtendedInternDashboard | undefined = undefined;
  let interns: Array<{ id: string; name: string | null; email: string }> = [];
  let totalInterns = 0;

  // Get paginated interns for tutors
  if (isTutor && process.env.NEXT_PHASE !== 'phase-production-build') {
    [interns, totalInterns] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'INTERN' },
        select: { id: true, name: true, email: true },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where: { role: 'INTERN' } }),
    ]);
  } else if (process.env.NEXT_PHASE !== 'phase-production-build') {
    interns = await prisma.user.findMany({
      where: { role: 'INTERN' },
      select: { id: true, name: true, email: true },
    });
    totalInterns = interns.length;
  }

  if (!isTutor) {
    dashboardData = await progressService.getInternProgress(user.id);
  }

  return (
    <Suspense
      fallback={
        <main className='max-w-5xl mx-auto p-4'>
          <div className='flex items-center justify-center h-64'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </main>
      }
    >
      <main className='max-w-7xl mx-auto p-4'>
        <DashboardClient
          isTutor={isTutor}
          interns={interns}
          totalInterns={totalInterns}
          page={page}
          limit={limit}
          dashboardData={dashboardData}
        />
      </main>
    </Suspense>
  );
}
