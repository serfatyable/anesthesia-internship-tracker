import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { progressService } from '@/lib/services/progressService';
import { ExportQuerySchema, ProgressAccessSchema } from '@/lib/validators/progress';

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
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    };

    const parsedQuery = ExportQuerySchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsedQuery.error.flatten() },
        { status: 400 },
      );
    }

    const { userId, from, to } = parsedQuery.data;

    // Validate access permissions
    const accessValidation = ProgressAccessSchema.safeParse({
      userId,
      requesterRole: session.user.role || 'INTERN',
      requesterId: session.user.id,
    });

    if (!accessValidation.success) {
      return NextResponse.json(
        { error: 'Access denied', details: accessValidation.error.flatten() },
        { status: 403 },
      );
    }

    // Prepare export parameters
    const exportParams = {
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };

    // Get export data
    const exportData = await progressService.exportLogs(exportParams);
    const csvContent = progressService.generateCSVContent(exportData);

    // Generate filename with date range if specified
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    let filename = `logs_${userId}_${dateStr}.csv`;

    if (from && to) {
      const fromStr = new Date(from).toISOString().split('T')[0];
      const toStr = new Date(to).toISOString().split('T')[0];
      filename = `logs_${userId}_${fromStr}_to_${toStr}.csv`;
    }

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('Export logs API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
