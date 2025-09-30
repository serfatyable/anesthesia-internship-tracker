import { NextResponse } from 'next/server';
import { listProceduresActive } from '@/lib/services/logs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const procedures = await listProceduresActive();
    const res = NextResponse.json({ procedures });
    // Cache for 5 minutes; allow stale while revalidate
    res.headers.set(
      'Cache-Control',
      'public, max-age=300, s-maxage=300, stale-while-revalidate=60'
    );
    return res;
  } catch (error) {
    console.error('Error fetching procedures:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
