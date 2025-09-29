import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/cases/[id]/favorite - Add or remove favorite
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: caseId } = await params;

    // Check if the case exists
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true },
    });

    if (!caseExists) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_caseId: {
          userId: session.user.id,
          caseId: caseId,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          userId_caseId: {
            userId: session.user.id,
            caseId: caseId,
          },
        },
      });
      return NextResponse.json({ favorited: false });
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          caseId: caseId,
        },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/cases/[id]/favorite - Check if case is favorited
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: caseId } = await params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_caseId: {
          userId: session.user.id,
          caseId: caseId,
        },
      },
    });

    return NextResponse.json({ favorited: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
