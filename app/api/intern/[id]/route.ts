import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Getting intern data for ID:', id);

    const session = await getServerSession(authOptions);
    console.log('API: Session:', !!session, session?.user?.role);

    if (!session?.user?.id) {
      console.log('API: No session, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;

    // Check if user is a tutor/admin
    if (user.role !== 'TUTOR' && user.role !== 'ADMIN') {
      console.log('API: User not tutor/admin, returning 403');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const internId = id;
    console.log('API: Processing intern ID:', internId);

    // Get intern information
    console.log('API: Fetching intern info for:', internId);
    const intern = await prisma.user.findUnique({
      where: { id: internId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!intern) {
      console.log('API: Intern not found');
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
    }
    console.log('API: Found intern:', intern.name || intern.email);

    // Check if this intern is already a favorite
    console.log('API: Checking if intern is favorite for tutor:', user.id);
    const isFavorite = await prisma.tutorFavoriteIntern.findUnique({
      where: {
        tutorId_internId: {
          tutorId: user.id,
          internId: intern.id,
        },
      },
    });
    console.log('API: Is favorite:', !!isFavorite);

    // Get all log entries for this intern
    console.log('API: Fetching log entries for intern:', internId);
    const logEntries = await prisma.logEntry.findMany({
      where: {
        internId: internId,
      },
      include: {
        procedure: {
          include: {
            rotation: true,
          },
        },
        verification: true, // This is the correct field name (singular)
      },
      orderBy: {
        date: 'desc',
      },
    });
    console.log('API: Found log entries:', logEntries.length);

    // Get all verifications for this intern
    console.log('API: Fetching verifications for intern:', internId);
    const verifications = await prisma.verification.findMany({
      where: {
        logEntry: {
          internId: internId,
        },
      },
      include: {
        logEntry: {
          include: {
            procedure: {
              include: {
                rotation: true,
              },
            },
          },
        },
      },
    });
    console.log('API: Found verifications:', verifications.length);

    // Get all procedures and their requirements
    console.log('API: Fetching all procedures');
    const allProcedures = await prisma.procedure.findMany({
      include: {
        rotation: true,
        requirements: true,
      },
    });
    console.log('API: Found procedures:', allProcedures.length);

    // Group by rotation to find the most active one (or we can use a different logic)
    const rotationStats = new Map();

    logEntries.forEach(le => {
      const rotationId = le.procedure.rotationId;
      const rotationName = le.procedure.rotation.name;

      if (!rotationStats.has(rotationId)) {
        rotationStats.set(rotationId, {
          id: rotationId,
          name: rotationName,
          logEntries: [],
          verifications: [],
        });
      }

      rotationStats.get(rotationId).logEntries.push(le);
    });

    verifications.forEach(v => {
      const rotationId = v.logEntry.procedure.rotationId;
      if (rotationStats.has(rotationId)) {
        rotationStats.get(rotationId).verifications.push(v);
      }
    });

    // Find the rotation with the most activity (this could be considered "active")
    let activeRotation = null;
    let maxActivity = 0;

    for (const [, stats] of rotationStats) {
      const activity = stats.logEntries.length + stats.verifications.length;
      if (activity > maxActivity) {
        maxActivity = activity;
        activeRotation = stats;
      }
    }

    // If no activity, get the first rotation
    if (!activeRotation && allProcedures.length > 0) {
      const firstRotation = allProcedures[0]?.rotation;
      if (firstRotation) {
        activeRotation = {
          id: firstRotation.id,
          name: firstRotation.name,
          logEntries: [],
          verifications: [],
        };
      }
    }

    if (!activeRotation) {
      return NextResponse.json(
        {
          error: 'No rotation data found',
        },
        { status: 404 }
      );
    }

    // Filter data for the active rotation
    const activeRotationLogEntries = logEntries.filter(
      le => le.procedure.rotationId === activeRotation.id
    );
    const activeRotationVerifications = verifications.filter(
      v => v.logEntry.procedure.rotationId === activeRotation.id
    );

    // Get procedures for this rotation
    const rotationProcedures = allProcedures.filter(
      p => p.rotationId === activeRotation.id
    );
    const rotationRequirements = rotationProcedures.flatMap(
      p => p.requirements
    );

    // Process procedures
    const procedures = {
      pending: activeRotationLogEntries
        .filter(le => le.verification && le.verification.status === 'PENDING')
        .map(le => ({
          id: le.id,
          name: le.procedure?.name || 'Unknown Procedure',
          logEntryId: le.id,
          count: le.count,
          date: le.date.toISOString(),
          notes: le.notes,
        })),
      completed: activeRotationVerifications
        .filter(v => v.status === 'APPROVED')
        .map(v => ({
          id: v.logEntry.id,
          name: v.logEntry.procedure?.name || 'Unknown Procedure',
          count: v.logEntry.count,
          date: v.logEntry.date.toISOString(),
          notes: v.logEntry.notes,
        })),
      notStarted: rotationProcedures
        .filter(
          proc =>
            !activeRotationLogEntries.some(le => le.procedureId === proc.id)
        )
        .map(proc => ({
          id: proc.id,
          name: proc.name,
          required:
            rotationRequirements.find(r => r.procedureId === proc.id)
              ?.minCount || 1,
        })),
    };

    // For now, we'll have empty knowledge since the schema doesn't show knowledge topics
    const knowledge = {
      pending: [],
      completed: [],
      notStarted: [],
    };

    // Calculate totals
    const totalRequired = rotationProcedures.length;
    const totalVerified = activeRotationVerifications.filter(
      v => v.status === 'APPROVED'
    ).length;
    const totalPending = procedures.pending.length;

    const completionPercentage =
      totalRequired > 0 ? Math.round((totalVerified / totalRequired) * 100) : 0;

    const activeRotationData = {
      id: activeRotation.id,
      name: activeRotation.name,
      required: totalRequired,
      verified: totalVerified,
      pending: totalPending,
      completionPercentage,
      procedures,
      knowledge,
    };

    const responseData = {
      intern,
      isFavorite: !!isFavorite,
      activeRotation: activeRotationData,
    };

    console.log('API: Returning data:', JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API: Error fetching intern data:', error);
    console.error(
      'API: Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    // Return more detailed error information for debugging
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
