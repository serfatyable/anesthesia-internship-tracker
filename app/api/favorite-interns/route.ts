import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ProgressService } from '@/lib/services/progressService';

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

    // Get favorite interns for this tutor
    const favoriteInterns = await prisma.tutorFavoriteIntern.findMany({
      where: { tutorId: user.id },
      include: {
        intern: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const progressService = new ProgressService();

    // Get progress data for each favorite intern
    const favoriteInternsWithProgress = await Promise.all(
      favoriteInterns.map(async (fav) => {
        try {
          const progress = await progressService.getInternProgress(fav.intern.id);
          return {
            intern: fav.intern,
            progress,
          };
        } catch (error) {
          console.error(`Error getting progress for intern ${fav.intern.id}:`, error);
          return {
            intern: fav.intern,
            progress: null,
          };
        }
      }),
    );

    return NextResponse.json({ favoriteInterns: favoriteInternsWithProgress });
  } catch (error) {
    console.error('Error fetching favorite interns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
