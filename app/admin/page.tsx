import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminDashboard } from '@/components/site/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as { user?: { role?: string | null } } | null)?.user?.role;
  if (!session || role !== 'ADMIN') redirect('/403');

  // Fetch admin dashboard data
  const [
    users,
    rotations,
    procedures,
    requirements,
    totalLogs,
    pendingVerifications,
    recentActivity
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            logs: true,
            verifications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.rotation.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            procedures: true,
            requirements: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.procedure.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        rotation: {
          select: { name: true }
        },
        _count: {
          select: {
            logs: true,
            requirements: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.requirement.findMany({
      select: {
        id: true,
        minCount: true,
        trainingLevel: true,
        rotation: {
          select: { name: true }
        },
        procedure: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.logEntry.count(),
    prisma.verification.count({
      where: { status: 'PENDING' }
    }),
    prisma.logEntry.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        date: true,
        count: true,
        notes: true,
        createdAt: true,
        intern: {
          select: { name: true, email: true }
        },
        procedure: {
          select: { name: true }
        },
        verification: {
          select: { status: true }
        }
      }
    })
  ]);

  const adminData = {
    users,
    rotations,
    procedures,
    requirements,
    stats: {
      totalUsers: users.length,
      totalRotations: rotations.length,
      totalProcedures: procedures.length,
      totalRequirements: requirements.length,
      totalLogs,
      pendingVerifications,
      activeRotations: rotations.filter(r => r.isActive).length
    },
    recentActivity
  };

  return (
    <main className="p-6">
      <AdminDashboard data={adminData} />
    </main>
  );
}