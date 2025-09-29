import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/requirements/route';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    requirement: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    rotation: {
      findUnique: vi.fn(),
    },
    procedure: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock RBAC
vi.mock('@/lib/rbac', () => ({
  requireRole: vi.fn(),
}));

describe('Requirements API', () => {
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { prisma } = await import('@/lib/db');
    mockPrisma = prisma;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/requirements', () => {
    it('should return requirements successfully', async () => {
      const mockRequirements = [
        {
          id: 'req1',
          rotationId: 'rot1',
          procedureId: 'proc1',
          minCount: 5,
          trainingLevel: 'beginner',
        },
        {
          id: 'req2',
          rotationId: 'rot2',
          procedureId: 'proc2',
          minCount: 3,
          trainingLevel: null,
        },
      ];

      mockPrisma.requirement.findMany.mockResolvedValue(mockRequirements);

      const request = new NextRequest('http://localhost:3000/api/requirements');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.requirements).toEqual(mockRequirements);
      expect(mockPrisma.requirement.findMany).toHaveBeenCalledWith({
        orderBy: {
          id: 'desc',
        },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.requirement.findMany.mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/requirements', () => {
    it('should create a requirement successfully', async () => {
      const { requireRole } = await import('@/lib/rbac');
      vi.mocked(requireRole).mockResolvedValue({ ok: true });

      const mockRequirement = {
        id: 'req1',
        rotationId: 'rot1',
        procedureId: 'proc1',
        minCount: 5,
        trainingLevel: 'beginner',
      };

      mockPrisma.rotation.findUnique.mockResolvedValue({
        id: 'rot1',
        name: 'ICU',
      });
      mockPrisma.procedure.findUnique.mockResolvedValue({
        id: 'proc1',
        name: 'Intubation',
      });
      mockPrisma.requirement.create.mockResolvedValue(mockRequirement);

      const requestBody = {
        rotationId: 'rot1',
        procedureId: 'proc1',
        minCount: 5,
        trainingLevel: 'beginner',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/requirements',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockRequirement);
      expect(mockPrisma.requirement.create).toHaveBeenCalledWith({
        data: {
          rotationId: 'rot1',
          procedureId: 'proc1',
          minCount: 5,
          trainingLevel: 'beginner',
        },
      });
    });

    it('should reject unauthorized access', async () => {
      const { requireRole } = await import('@/lib/rbac');
      vi.mocked(requireRole).mockResolvedValue({ ok: false });

      const request = new NextRequest(
        'http://localhost:3000/api/requirements',
        {
          method: 'POST',
          body: JSON.stringify({}),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should handle invalid JSON', async () => {
      const { requireRole } = await import('@/lib/rbac');
      vi.mocked(requireRole).mockResolvedValue({ ok: true });

      const request = new NextRequest(
        'http://localhost:3000/api/requirements',
        {
          method: 'POST',
          body: 'invalid json',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should handle missing rotation', async () => {
      const { requireRole } = await import('@/lib/rbac');
      vi.mocked(requireRole).mockResolvedValue({ ok: true });

      mockPrisma.rotation.findUnique.mockResolvedValue(null);
      mockPrisma.procedure.findUnique.mockResolvedValue({
        id: 'proc1',
        name: 'Intubation',
      });

      const requestBody = {
        rotationId: 'nonexistent',
        procedureId: 'proc1',
        minCount: 5,
        trainingLevel: 'beginner',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/requirements',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Rotation not found');
    });

    it('should handle missing procedure', async () => {
      const { requireRole } = await import('@/lib/rbac');
      vi.mocked(requireRole).mockResolvedValue({ ok: true });

      mockPrisma.rotation.findUnique.mockResolvedValue({
        id: 'rot1',
        name: 'ICU',
      });
      mockPrisma.procedure.findUnique.mockResolvedValue(null);

      const requestBody = {
        rotationId: 'rot1',
        procedureId: 'nonexistent',
        minCount: 5,
        trainingLevel: 'beginner',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/requirements',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Procedure not found');
    });

    it('should handle validation errors', async () => {
      const { requireRole } = await import('@/lib/rbac');
      vi.mocked(requireRole).mockResolvedValue({ ok: true });

      const requestBody = {
        rotationId: '', // Invalid: empty string
        procedureId: 'proc1',
        minCount: 0, // Invalid: must be at least 1
        trainingLevel: 'beginner',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/requirements',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
      expect(data.details).toBeDefined();
    });
  });
});
