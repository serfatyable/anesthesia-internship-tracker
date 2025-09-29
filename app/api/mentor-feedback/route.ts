import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  isValidItemType,
  validateString,
  validateContent,
  validateUserId,
  validateItemId,
} from '@/lib/validation';

// GET: Fetch feedback for a specific item (procedure/knowledge)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    let itemId: string;
    let itemType: 'PROCEDURE' | 'KNOWLEDGE';

    try {
      itemId = validateItemId(searchParams.get('itemId'));
      const itemTypeRaw = validateString(
        searchParams.get('itemType'),
        'Item type'
      );

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
              : 'Invalid parameters',
        },
        { status: 400 }
      );
    }

    // Get feedback for this specific item, grouped by mentor
    const feedback = await prisma.mentorFeedback.findMany({
      where: {
        internId: session.user.id,
        itemId,
        itemType,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ mentor: { name: 'asc' } }, { createdAt: 'desc' }],
      // Add limit to prevent large queries
      take: 100,
    });

    // Group feedback by mentor
    const groupedFeedback = feedback.reduce(
      (acc, item) => {
        const mentorId = item.mentor.id;
        if (!acc[mentorId]) {
          acc[mentorId] = {
            mentor: item.mentor,
            feedback: [],
          };
        }
        acc[mentorId].feedback.push({
          id: item.id,
          content: item.content,
          isRead: item.isRead,
          createdAt: item.createdAt,
        });
        return acc;
      },
      {} as Record<string, { mentor: unknown; feedback: unknown[] }>
    );

    const response = NextResponse.json({
      itemId,
      itemType,
      feedback: Object.values(groupedFeedback),
      totalCount: feedback.length,
      unreadCount: feedback.filter(f => !f.isRead).length,
    });

    response.headers.set(
      'Cache-Control',
      'private, max-age=60, stale-while-revalidate=300'
    );
    return response;
  } catch (error) {
    console.error('Error fetching mentor feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new feedback (mentors only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a mentor
    if (session.user.role !== 'MENTOR') {
      return NextResponse.json(
        { error: 'Only mentors can provide feedback' },
        { status: 403 }
      );
    }

    const rawData = await request.json();

    let internId: string;
    let itemId: string;
    let itemType: 'PROCEDURE' | 'KNOWLEDGE';
    let content: string;

    try {
      internId = validateUserId(rawData.internId);
      itemId = validateItemId(rawData.itemId);
      const itemTypeRaw = validateString(rawData.itemType, 'Item type');

      if (!isValidItemType(itemTypeRaw)) {
        throw new Error('Item type must be PROCEDURE or KNOWLEDGE');
      }

      itemType = itemTypeRaw;
      content = validateContent(rawData.content);
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

    // Verify the intern exists and is actually an intern
    const intern = await prisma.user.findUnique({
      where: { id: internId },
      select: { id: true, role: true, name: true },
    });

    if (!intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
    }

    if (intern.role !== 'INTERN') {
      return NextResponse.json(
        { error: 'User is not an intern' },
        { status: 400 }
      );
    }

    // Create the feedback
    const feedback = await prisma.mentorFeedback.create({
      data: {
        internId,
        mentorId: session.user.id,
        itemId,
        itemType,
        content,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error creating mentor feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Mark feedback as read
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await request.json();

    let feedbackId: string;

    try {
      feedbackId = validateString(rawData.feedbackId, 'Feedback ID');
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

    // Mark feedback as read
    const feedback = await prisma.mentorFeedback.update({
      where: {
        id: feedbackId,
        internId: session.user.id, // Ensure only the intern can mark their own feedback as read
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error updating mentor feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
