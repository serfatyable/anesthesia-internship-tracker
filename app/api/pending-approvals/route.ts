import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const isTutor = user.role === 'TUTOR' || user.role === 'ADMIN';

    if (!isTutor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get pending verifications with limit for preview
    const pendingItems = await prisma.verification.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        logEntry: {
          include: {
            procedure: true,
            intern: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 20, // Limit for preview
    });

    const formattedItems = pendingItems.map((item) => ({
      id: item.id,
      procedureName: item.logEntry.procedure.name,
      internName: item.logEntry.intern.name || item.logEntry.intern.email,
      internId: item.logEntry.intern.id,
      date: item.logEntry.date,
      count: item.logEntry.count,
      createdAt: item.timestamp || item.logEntry.createdAt,
    }));

    return NextResponse.json({ pendingItems: formattedItems });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
