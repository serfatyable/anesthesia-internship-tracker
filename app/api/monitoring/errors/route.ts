// app/api/monitoring/errors/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity') as 'low' | 'medium' | 'high' | 'critical' | null;
    const resolved = searchParams.get('resolved') === 'true' ? true : searchParams.get('resolved') === 'false' ? false : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const errors = monitoring.getErrors({
      severity: severity || undefined,
      resolved,
      limit,
    });

    const stats = monitoring.getErrorStats();

    return NextResponse.json({
      success: true,
      data: {
        errors,
        stats,
        total: errors.length,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error retrieval failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { errorId } = body;

    if (!errorId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error ID is required',
        },
        { status: 400 }
      );
    }

    const resolved = monitoring.resolveError(errorId);

    if (!resolved) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Error resolved successfully',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error resolution failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
