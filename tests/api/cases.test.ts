/**
 * Cases API tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import * as NextAuthNext from 'next-auth/next';

// Mock NextAuth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    case: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock monitoring
vi.mock('@/lib/utils/monitoring', () => ({
  monitoring: {
    recordMetric: vi.fn(),
    recordError: vi.fn(),
  },
}));

describe('Cases API', () => {
  const mockSession = {
    user: {
      id: 'user_123',
      email: 'test@example.com',
      role: 'INTERN',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (NextAuthNext.getServerSession as any).mockResolvedValue(mockSession);
  });

  describe('GET /api/cases', () => {
    it('should return cases with pagination', async () => {
      const { GET } = await import('../../app/api/cases/route');
      const mockCases = [
        {
          id: 'case_1',
          title: 'Test Case 1',
          category: 'Cardiac',
          description: 'Test description',
          createdAt: new Date(),
          _count: { comments: 0, favorites: 0 },
          favorites: [],
          author: { id: 'user_123', name: 'Test User', email: 'test@example.com' },
        },
      ];

      (prisma.case.findMany as any).mockResolvedValue(mockCases);
      (prisma.case.count as any).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/cases?page=1&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cases).toHaveLength(1);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.totalCount).toBe(1);
    });

    it('should filter cases by category', async () => {
      const { GET } = await import('../../app/api/cases/route');
      (prisma.case.findMany as any).mockResolvedValue([]);
      (prisma.case.count as any).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/cases?category=Cardiac');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Cardiac',
          }),
        }),
      );
    });

    it('should search cases by title and description', async () => {
      const { GET } = await import('../../app/api/cases/route');
      (prisma.case.findMany as any).mockResolvedValue([]);
      (prisma.case.count as any).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/cases?search=test');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      const { GET } = await import('../../app/api/cases/route');
      (NextAuthNext.getServerSession as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/cases');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/cases', () => {
    it('should create a new case with valid data', async () => {
      const { POST } = await import('../../app/api/cases/route');
      const mockCase = {
        id: 'case_123',
        title: 'Test Case',
        category: 'Cardiac',
        description: 'Test description',
        authorId: 'user_123',
        createdAt: new Date(),
        _count: { comments: 0, favorites: 0 },
        author: { id: 'user_123', name: 'Test User', email: 'test@example.com' },
      };

      (prisma.case.create as any).mockResolvedValue(mockCase);

      const request = new NextRequest('http://localhost:3000/api/cases', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Case',
          category: 'Cardiac',
          description: 'Test description',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Test Case');
      expect(data.category).toBe('Cardiac');
    });

    it('should reject invalid data', async () => {
      const { POST } = await import('../../app/api/cases/route');
      const request = new NextRequest('http://localhost:3000/api/cases', {
        method: 'POST',
        body: JSON.stringify({
          title: '', // Invalid: empty title
          category: 'Cardiac',
          description: 'Test description',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should sanitize input data', async () => {
      const { POST } = await import('../../app/api/cases/route');
      const mockCase = {
        id: 'case_123',
        title: 'Test Case',
        category: 'Cardiac',
        description: 'Test description',
        authorId: 'user_123',
        createdAt: new Date(),
        _count: { comments: 0, favorites: 0 },
        author: { id: 'user_123', name: 'Test User', email: 'test@example.com' },
      };

      (prisma.case.create as any).mockResolvedValue(mockCase);

      const request = new NextRequest('http://localhost:3000/api/cases', {
        method: 'POST',
        body: JSON.stringify({
          title: '<script>alert("xss")</script>Test Case',
          category: 'Cardiac',
          description: 'Test description',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.case.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test Case', // Script tag should be removed
          }),
        }),
      );
    });
  });
});
