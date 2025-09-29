import { NextResponse } from 'next/server';
import { listProceduresActive } from '@/lib/services/logs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const procedures = await listProceduresActive();
    return NextResponse.json({ procedures });
  } catch (error) {
    console.error('Error fetching procedures:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
