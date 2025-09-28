import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const ReflectionSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(['PROCEDURE', 'KNOWLEDGE']),
  content: z.string().min(1, 'Content is required'),
  image1Url: z.string().optional(),
  image2Url: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = ReflectionSchema.parse(body);

    // Upsert reflection (update if exists, create if not)
    const reflection = await prisma.reflection.upsert({
      where: {
        internId_itemId_itemType: {
          internId: session.user.id,
          itemId: validatedData.itemId,
          itemType: validatedData.itemType,
        },
      },
      update: {
        content: validatedData.content,
        image1Url: validatedData.image1Url || null,
        image2Url: validatedData.image2Url || null,
        updatedAt: new Date(),
      },
      create: {
        internId: session.user.id,
        itemId: validatedData.itemId,
        itemType: validatedData.itemType,
        content: validatedData.content,
        image1Url: validatedData.image1Url || null,
        image2Url: validatedData.image2Url || null,
      },
    });

    return NextResponse.json({ success: true, reflection });
  } catch (error) {
    console.error('Reflection API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'itemId and itemType are required' }, { status: 400 });
    }

    const reflection = await prisma.reflection.findUnique({
      where: {
        internId_itemId_itemType: {
          internId: session.user.id,
          itemId,
          itemType: itemType as 'PROCEDURE' | 'KNOWLEDGE',
        },
      },
    });

    return NextResponse.json({ reflection });
  } catch (error) {
    console.error('Reflection GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'itemId and itemType are required' }, { status: 400 });
    }

    // Only interns can delete their own reflections
    if (session.user.role !== 'INTERN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.reflection.delete({
      where: {
        internId_itemId_itemType: {
          internId: session.user.id,
          itemId,
          itemType: itemType as 'PROCEDURE' | 'KNOWLEDGE',
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reflection DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
