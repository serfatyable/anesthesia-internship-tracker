import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createRequirementSchema = z.object({
  rotationId: z.string().min(1, 'Rotation ID is required'),
  procedureId: z.string().min(1, 'Procedure ID is required'),
  minCount: z.number().min(1, 'Minimum count must be at least 1'),
  trainingLevel: z.string().optional(),
});

export async function GET() {
  try {
    const requirements = await prisma.requirement.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error('Get requirements error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const gate = await requireRole('ADMIN');
  if (!gate.ok)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validatedData = createRequirementSchema.parse(body);

    // Verify rotation and procedure exist
    const [rotation, procedure] = await Promise.all([
      prisma.rotation.findUnique({ where: { id: validatedData.rotationId } }),
      prisma.procedure.findUnique({ where: { id: validatedData.procedureId } }),
    ]);

    if (!rotation) {
      return NextResponse.json(
        { error: 'Rotation not found' },
        { status: 404 }
      );
    }
    if (!procedure) {
      return NextResponse.json(
        { error: 'Procedure not found' },
        { status: 404 }
      );
    }

    const created = await prisma.requirement.create({
      data: {
        rotationId: validatedData.rotationId,
        procedureId: validatedData.procedureId,
        minCount: validatedData.minCount,
        trainingLevel: validatedData.trainingLevel || null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create requirement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
