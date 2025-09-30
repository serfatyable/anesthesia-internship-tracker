import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CreateLogSchema } from '@/lib/validators/logs';
import { listMyLogs } from '@/lib/services/logs';
import { apiRateLimit } from '@/lib/middleware/rateLimit';
import { sanitizeNotes } from '@/lib/utils/sanitize';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
    const limit = limitParam
      ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 50))
      : 50;

    const result = await listMyLogs(session.user.id, { page, limit });
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Logs API error:', error);

    // Return appropriate error based on error type
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to load logs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = apiRateLimit(req as NextRequest);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Sanitize notes if provided
    if (body.notes) {
      body.notes = sanitizeNotes(body.notes);
    }

    const parsed = CreateLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { procedureId, date, count, notes } = parsed.data;
    const when = new Date(date);

    // Validate date is not in the future
    if (when > new Date()) {
      return NextResponse.json(
        { error: 'Date cannot be in the future' },
        { status: 400 }
      );
    }

    const created = await prisma.logEntry.create({
      data: {
        internId: session.user.id,
        procedureId,
        date: when,
        count,
        notes: notes || null,
        verification: { create: { status: 'PENDING', verifierId: null } },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create log API error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to create log', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
