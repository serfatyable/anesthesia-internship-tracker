import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { progressService } from '@/lib/services/progressService';
import {
  ExportQuerySchema,
  ProgressAccessSchema,
} from '@/lib/validators/progress';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Auth
    const rawSession = await getServerSession(authOptions);
    const user = (
      rawSession as unknown as {
        user?: { id?: string; role?: string | null };
      } | null
    )?.user;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse & validate query
    const { searchParams } = new URL(request.url);
    const queryParams = {
      userId: searchParams.get('userId') || user.id,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    };

    const parsedQuery = ExportQuerySchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: parsedQuery.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { userId, from, to } = parsedQuery.data;

    // RBAC check
    const accessValidation = ProgressAccessSchema.safeParse({
      userId,
      requesterRole: user?.role ?? 'INTERN',
      requesterId: user.id,
    });
    if (!accessValidation.success) {
      return NextResponse.json(
        { error: 'Access denied', details: accessValidation.error.flatten() },
        { status: 403 }
      );
    }

    // Prepare export
    const exportParams = {
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };

    // Build CSV
    const exportData = await progressService.exportLogs(exportParams);
    const csvContent = progressService.generateCSVContent(exportData);

    // Filename
    const now = new Date();
    const filenameParts = ['logs'];
    if (from) filenameParts.push(`from-${from}`);
    if (to) filenameParts.push(`to-${to}`);
    filenameParts.push(now.toISOString().split('T')[0] || 'unknown');
    const filename = `${filenameParts.join('_')}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Export logs failed', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
