import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  isValidItemType,
  validateString,
  validateItemId,
} from '@/lib/validation';

// GET /api/procedure-knowledge-favorites - Get user's favorite procedures and knowledge
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.procedureKnowledgeFavorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        itemId: true,
        itemType: true,
        createdAt: true,
      },
    });

    const response = NextResponse.json(favorites);

    // Add caching headers for better performance
    response.headers.set(
      'Cache-Control',
      'private, max-age=60, stale-while-revalidate=300'
    );

    return response;
  } catch (error) {
    console.error('Error fetching procedure/knowledge favorites:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'FETCH_FAVORITES_ERROR',
      },
      { status: 500 }
    );
  }
}

// POST /api/procedure-knowledge-favorites - Add a procedure or knowledge to favorites
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await request.json();

    let itemId: string;
    let itemType: 'PROCEDURE' | 'KNOWLEDGE';

    try {
      itemId = validateItemId(rawData.itemId);
      const itemTypeRaw = validateString(rawData.itemType, 'Item type');

      if (!isValidItemType(itemTypeRaw)) {
        throw new Error('Item type must be PROCEDURE or KNOWLEDGE');
      }

      itemType = itemTypeRaw;
    } catch (validationError) {
      return NextResponse.json(
        {
          error:
            validationError instanceof Error
              ? validationError.message
              : 'Invalid input data',
        },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.procedureKnowledgeFavorite.findUnique(
      {
        where: {
          userId_itemId_itemType: {
            userId: session.user.id,
            itemId,
            itemType,
          },
        },
      }
    );

    if (existingFavorite) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 400 });
    }

    const favorite = await prisma.procedureKnowledgeFavorite.create({
      data: {
        userId: session.user.id,
        itemId,
        itemType,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('Error adding procedure/knowledge to favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/procedure-knowledge-favorites - Remove a procedure or knowledge from favorites
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await request.json();

    let itemId: string;
    let itemType: 'PROCEDURE' | 'KNOWLEDGE';

    try {
      itemId = validateItemId(rawData.itemId);
      const itemTypeRaw = validateString(rawData.itemType, 'Item type');

      if (!isValidItemType(itemTypeRaw)) {
        throw new Error('Item type must be PROCEDURE or KNOWLEDGE');
      }

      itemType = itemTypeRaw;
    } catch (validationError) {
      return NextResponse.json(
        {
          error:
            validationError instanceof Error
              ? validationError.message
              : 'Invalid input data',
        },
        { status: 400 }
      );
    }

    const deleted = await prisma.procedureKnowledgeFavorite.deleteMany({
      where: {
        userId: session.user.id,
        itemId,
        itemType,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing procedure/knowledge from favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
