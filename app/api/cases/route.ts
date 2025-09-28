import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { apiRateLimit } from '@/lib/middleware/rateLimit';
import { sanitizeString, sanitizeHtml } from '@/lib/utils/validation';
import { withErrorHandling } from '@/lib/middleware/errorHandler';
import { monitoring } from '@/lib/utils/monitoring';

export const dynamic = 'force-dynamic';

const createCaseSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  image1Url: z.string().url().optional(),
  image2Url: z.string().url().optional(),
  image3Url: z.string().url().optional(),
});

// Removed unused schema

// GET /api/cases - Get cases with pagination and filtering
export const GET = withErrorHandling(async (request: NextRequest) => {
  const startTime = performance.now();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const skip = (page - 1) * limit;

  // Build where clause with proper sanitization
  const where: Record<string, unknown> = {};
  if (category && category !== 'all') {
    where.category = sanitizeString(category, 100);
  }
  if (search) {
    const sanitizedSearch = sanitizeString(search, 200);
    where.OR = [
      { title: { contains: sanitizedSearch, mode: 'insensitive' } },
      { description: { contains: sanitizedSearch, mode: 'insensitive' } },
    ];
  }

  const [cases, totalCount] = await Promise.all([
    prisma.case.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // Most recent first
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
        favorites: {
          where: { userId: session.user.id },
          select: { id: true },
        },
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.case.count({ where }),
  ]);

  const hasMore = skip + cases.length < totalCount;
  const duration = performance.now() - startTime;

  // Record performance metrics
  monitoring.recordMetric('api.cases.get.duration', duration);
  monitoring.recordMetric('api.cases.get.count', cases.length);

  return NextResponse.json({
    cases,
    pagination: {
      page,
      limit,
      totalCount,
      hasMore,
    },
  });
});

// POST /api/cases - Create a new case
export const POST = withErrorHandling(async (request: NextRequest) => {
  const startTime = performance.now();

  // Apply rate limiting
  const rateLimitResponse = apiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Enhanced sanitization
  const sanitizedBody = {
    ...body,
    title: sanitizeString(body.title || '', 200),
    description: sanitizeHtml(body.description || ''),
    category: sanitizeString(body.category || '', 100),
    image1Url: body.image1Url ? sanitizeUrl(body.image1Url) : undefined,
    image2Url: body.image2Url ? sanitizeUrl(body.image2Url) : undefined,
    image3Url: body.image3Url ? sanitizeUrl(body.image3Url) : undefined,
  };

  const validatedData = createCaseSchema.parse(sanitizedBody);

  const newCase = await prisma.case.create({
    data: {
      title: validatedData.title,
      category: validatedData.category,
      description: validatedData.description,
      image1Url: validatedData.image1Url || null,
      image2Url: validatedData.image2Url || null,
      image3Url: validatedData.image3Url || null,
      authorId: session.user.id,
    },
    include: {
      _count: {
        select: {
          comments: true,
          favorites: true,
        },
      },
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const duration = performance.now() - startTime;
  monitoring.recordMetric('api.cases.post.duration', duration);
  monitoring.recordMetric('api.cases.post.success', 1);

  return NextResponse.json(newCase, { status: 201 });
});
