import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
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

    const { internId, isFavorite } = await request.json();

    if (!internId) {
      return NextResponse.json(
        { error: 'Intern ID is required' },
        { status: 400 }
      );
    }

    // Verify the intern exists
    const intern = await prisma.user.findUnique({
      where: { id: internId, role: 'INTERN' },
    });

    if (!intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
    }

    if (isFavorite) {
      // Remove from favorites
      await prisma.tutorFavoriteIntern.deleteMany({
        where: {
          tutorId: user.id,
          internId: internId,
        },
      });
    } else {
      // Add to favorites
      await prisma.tutorFavoriteIntern.create({
        data: {
          tutorId: user.id,
          internId: internId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error managing favorite intern:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
