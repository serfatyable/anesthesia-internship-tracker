'use client';
import dynamic from 'next/dynamic';

const InternDashboard = dynamic(
  () => import('@/components/site/dashboard/InternDashboard').then((mod) => mod.InternDashboard),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ssr: false,
  },
);
const TutorDashboard = dynamic(
  () => import('@/components/site/dashboard/TutorDashboard').then((mod) => mod.TutorDashboard),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ssr: false,
  },
);

export default function DashboardClient({
  isTutor,
  interns,
  totalInterns,
  page,
  limit,
  dashboardData,
}: {
  isTutor: boolean;
  interns: Array<{ id: string; name: string | null; email: string }>;
  totalInterns: number;
  page: number;
  limit: number;
  dashboardData: any;
}) {
  if (isTutor) {
    return (
      <section className="space-y-6">
        <TutorDashboard interns={interns} totalInterns={totalInterns} page={page} limit={limit} />
      </section>
    );
  }
  if (!dashboardData || !dashboardData.summary) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 p-6 rounded-lg text-center">
        <h2 className="text-lg font-semibold mb-2">Dashboard Error</h2>
        <p>
          Intern dashboard data is missing or invalid. Please contact support or try again later.
        </p>
      </div>
    );
  }
  return (
    <section className="space-y-6">
      <InternDashboard dashboard={dashboardData} />
    </section>
  );
}
