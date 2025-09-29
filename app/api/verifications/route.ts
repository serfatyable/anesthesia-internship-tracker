import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { VerifyLogSchema } from '@/lib/validators/logs';
import { canReviewLogs } from '@/lib/auth/permissions';
import { logger } from '@/lib/utils/logger';
import { strictRateLimit } from '@/lib/middleware/rateLimit';
import { sanitizeNotes } from '@/lib/utils/sanitize';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Apply strict rate limiting for verification endpoint
  const rateLimitResponse = strictRateLimit(req as NextRequest);
  if (rateLimitResponse) return rateLimitResponse;

  const startTime = Date.now();
  logger.request('POST', '/api/verifications', 0);

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const u = session?.user;
  if (!u?.id || !u.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canReviewLogs({ id: u.id, role: u.role }))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch (error) {
    logger.warn('Invalid JSON in verification request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // Sanitize reason if provided
  if (body.reason) {
    body.reason = sanitizeNotes(body.reason);
  }

  const parsed = VerifyLogSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn('Invalid verification request', { errors: JSON.stringify(parsed.error.flatten()) });
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { logEntryId, status, reason } = parsed.data;

  // Ensure the log exists and is pending
  const log = await prisma.logEntry.findUnique({
    where: { id: logEntryId },
    select: { verification: { select: { id: true, status: true } } },
  });

  if (!log || !log.verification) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 });
  }
  if (log.verification.status !== 'PENDING') {
    return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });
  }

  // For REJECTED, require reason
  if (status === 'REJECTED' && (!reason || reason.trim().length === 0)) {
    return NextResponse.json({ error: 'Reason is required when rejecting' }, { status: 400 });
  }

  await prisma.verification.update({
    where: { id: log.verification.id },
    data: {
      status,
      reason: reason || null,
      verifierId: session.user.id,
      timestamp: new Date(),
    },
  });

  // Log the verification decision
  logger.verificationDecision(status === 'APPROVED' ? 'APPROVE' : 'REJECT', logEntryId, reason);
  logger.request('POST', '/api/verifications', Date.now() - startTime);

  return NextResponse.json({ ok: true });
}
