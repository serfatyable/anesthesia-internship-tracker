import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const QuizResultSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(['PROCEDURE', 'KNOWLEDGE']),
  passed: z.boolean(),
  score: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = QuizResultSchema.parse(body);

    // Upsert quiz result (update if exists, create if not)
    const quizResult = await prisma.quizResult.upsert({
      where: {
        internId_itemId_itemType: {
          internId: session.user.id,
          itemId: validatedData.itemId,
          itemType: validatedData.itemType,
        },
      },
      update: {
        passed: validatedData.passed,
        score: validatedData.score,
        updatedAt: new Date(),
      },
      create: {
        internId: session.user.id,
        itemId: validatedData.itemId,
        itemType: validatedData.itemType,
        passed: validatedData.passed,
        score: validatedData.score,
      },
    });

    return NextResponse.json({ success: true, quizResult });
  } catch (error) {
    console.error('Quiz result API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'itemId and itemType are required' },
        { status: 400 }
      );
    }

    const quizResult = await prisma.quizResult.findUnique({
      where: {
        internId_itemId_itemType: {
          internId: session.user.id,
          itemId,
          itemType: itemType as 'PROCEDURE' | 'KNOWLEDGE',
        },
      },
    });

    return NextResponse.json({ quizResult });
  } catch (error) {
    console.error('Quiz result GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
