import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { progressService } from '@/lib/services/progressService';
import {
  ProgressQuerySchema,
  ProgressAccessSchema,
} from '@/lib/validators/progress';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      userId: searchParams.get('userId') || session.user.id,
      tab: searchParams.get('tab') || 'intern',
    };

    const parsedQuery = ProgressQuerySchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: parsedQuery.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { userId, tab } = parsedQuery.data;

    // Validate access permissions
    const accessValidation = ProgressAccessSchema.safeParse({
      userId,
      requesterRole: session.user.role || 'INTERN',
      requesterId: session.user.id,
    });

    if (!accessValidation.success) {
      return NextResponse.json(
        { error: 'Access denied', details: accessValidation.error.flatten() },
        { status: 403 }
      );
    }

    // Get progress data based on tab
    if (tab === 'overview') {
      // Only TUTOR and ADMIN can access overview
      if (session.user.role !== 'TUTOR' && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Access denied: overview tab requires TUTOR or ADMIN role' },
          { status: 403 }
        );
      }

      const overview = await progressService.getDashboardOverview();
      return NextResponse.json(overview);
    } else {
      // Get intern-specific progress
      const progress = await progressService.getInternProgress(userId);
      return NextResponse.json(progress);
    }
  } catch (error: unknown) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
