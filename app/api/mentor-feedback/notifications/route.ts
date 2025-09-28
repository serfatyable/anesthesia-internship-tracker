import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Get notification counts for unread feedback
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get unread feedback grouped by item (for specific item notifications)
    // This also gives us the total count
    const unreadByItem = await prisma.mentorFeedback.groupBy({
      by: ['itemId', 'itemType'],
      where: {
        internId: session.user.id,
        isRead: false,
      },
      _count: {
        id: true,
      },
    });

    // Calculate total unread count
    const unreadCount = unreadByItem.reduce((total, item) => total + item._count.id, 0);

    // Transform to a more usable format
    const itemNotifications = unreadByItem.map((item) => ({
      itemId: item.itemId,
      itemType: item.itemType,
      unreadCount: item._count.id,
    }));

    const response = NextResponse.json({
      totalUnreadCount: unreadCount,
      itemNotifications,
    });

    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('Error fetching feedback notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
