import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db';
import { VerifyLogSchema } from '@/lib/validators/logs';
import { canReviewLogs } from '@/lib/auth/permissions';
import { auditService } from '@/lib/services/auditService';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const u = session?.user;
  if (!u?.id || !u.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!canReviewLogs({ id: u.id, role: u.role }))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = VerifyLogSchema.safeParse(body);
  if (!parsed.success) {
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

  // Log audit event
  const auditAction =
    status === 'APPROVED'
      ? 'VERIFICATION_APPROVED'
      : status === 'REJECTED'
        ? 'VERIFICATION_REJECTED'
        : 'VERIFICATION_NEEDS_REVISION';

  await auditService.logVerificationAction(
    session.user.id,
    logEntryId,
    auditAction,
    reason ? `Reason: ${reason}` : undefined,
  );

  return NextResponse.json({ ok: true });
}
