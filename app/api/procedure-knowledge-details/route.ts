import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/procedure-knowledge-details?itemId=xxx&itemType=PROCEDURE|KNOWLEDGE
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'itemId and itemType are required' }, { status: 400 });
    }

    if (!['PROCEDURE', 'KNOWLEDGE'].includes(itemType)) {
      return NextResponse.json(
        { error: 'itemType must be PROCEDURE or KNOWLEDGE' },
        { status: 400 },
      );
    }

    // Check if item is favorited by user
    const isFavorited = await prisma.procedureKnowledgeFavorite.findUnique({
      where: {
        userId_itemId_itemType: {
          userId: session.user.id,
          itemId,
          itemType,
        },
      },
    });

    if (itemType === 'PROCEDURE') {
      // For procedures, we'll return mock data since the current system uses mock data
      // In a real implementation, you'd query the actual procedure from the database
      const mockProcedure = {
        id: itemId,
        name: `Procedure ${itemId}`,
        description: `Description for procedure ${itemId}`,
        category: 'Mock Category',
        rotation: 'Mock Rotation',
        isFavorited: !!isFavorited,
      };

      return NextResponse.json(mockProcedure);
    } else {
      // For knowledge topics, we'll return mock data since the current system uses mock data
      const mockKnowledge = {
        id: itemId,
        name: `Knowledge Topic ${itemId}`,
        description: `Description for knowledge topic ${itemId}`,
        category: 'Mock Category',
        rotation: 'Mock Rotation',
        isFavorited: !!isFavorited,
      };

      return NextResponse.json(mockKnowledge);
    }
  } catch (error) {
    console.error('Error fetching procedure/knowledge details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
