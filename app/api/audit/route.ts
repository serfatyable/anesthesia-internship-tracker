import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { auditService } from '@/lib/services/auditService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view audit logs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let auditLogs;

    if (entity && entityId) {
      // Get audit logs for specific entity
      auditLogs = await auditService.getAuditLogs(entity, entityId, limit);
    } else {
      // Get all recent audit logs
      auditLogs = await auditService.getUserAuditLogs(session.user.id, limit);
    }

    return NextResponse.json({ auditLogs });
  } catch (error: unknown) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
