import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST: Create mock feedback for testing
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a mentor
    if (session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Only mentors can create feedback' }, { status: 403 });
    }

    const { internId, itemId, itemType } = await request.json();

    if (!internId || !itemId || !itemType) {
      return NextResponse.json(
        { error: 'internId, itemId, and itemType are required' },
        { status: 400 },
      );
    }

    if (!['PROCEDURE', 'KNOWLEDGE'].includes(itemType)) {
      return NextResponse.json(
        { error: 'itemType must be PROCEDURE or KNOWLEDGE' },
        { status: 400 },
      );
    }

    // Verify the intern exists
    const intern = await prisma.user.findUnique({
      where: { id: internId },
    });

    if (!intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
    }

    // Generate mock feedback content
    const mockFeedbackContent = [
      'Great work on this procedure! Your technique was excellent and you showed good understanding of the anatomy.',
      'I noticed you handled the complications well. Consider focusing more on patient communication next time.',
      'Your knowledge of the topic is solid. I recommend reviewing the latest guidelines for additional context.',
      'Well done! You demonstrated good clinical reasoning and decision-making skills.',
      'Good effort overall. Try to be more systematic in your approach next time.',
      'Excellent performance! You showed great attention to detail and patient safety.',
      'Your understanding is good, but I suggest practicing the technical aspects more.',
      'Nice work! You handled the situation professionally and efficiently.',
    ];

    const randomContent =
      mockFeedbackContent[Math.floor(Math.random() * mockFeedbackContent.length)] ||
      'Great work on this task!';

    // Create the mock feedback
    const feedback = await prisma.mentorFeedback.create({
      data: {
        internId,
        mentorId: session.user.id,
        itemId,
        itemType,
        content: randomContent,
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
    console.error('Error creating mock mentor feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
