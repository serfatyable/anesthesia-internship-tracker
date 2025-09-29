import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getInternProgress,
  getTutorProgress,
  getInternsList,
} from '@/lib/progress';
import { prisma } from '@/lib/db';

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    rotation: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    logEntry: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

const mockPrisma = vi.mocked(prisma);

describe('Progress Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInternProgress', () => {
    it('should calculate progress correctly for an intern with mixed verification statuses', async () => {
      // Mock data
      const mockRotations = [
        {
          id: 'rotation1',
          name: 'ICU',
          isActive: true,
          requirements: [
            { minCount: 5, procedure: { id: 'proc1', name: 'Arterial Line' } },
            { minCount: 3, procedure: { id: 'proc2', name: 'Central Line' } },
          ],
        },
        {
          id: 'rotation2',
          name: 'PACU',
          isActive: true,
          requirements: [
            { minCount: 4, procedure: { id: 'proc3', name: 'Extubation' } },
          ],
        },
      ];

      const mockLogEntries = [
        // ICU logs
        {
          id: 'log1',
          count: 3,
          procedure: { id: 'proc1', rotationId: 'rotation1' },
          verification: { status: 'APPROVED' },
        },
        {
          id: 'log2',
          count: 2,
          procedure: { id: 'proc1', rotationId: 'rotation1' },
          verification: { status: 'PENDING' },
        },
        {
          id: 'log3',
          count: 1,
          procedure: { id: 'proc2', rotationId: 'rotation1' },
          verification: { status: 'APPROVED' },
        },
        // PACU logs
        {
          id: 'log4',
          count: 2,
          procedure: { id: 'proc3', rotationId: 'rotation2' },
          verification: { status: 'APPROVED' },
        },
      ];

      (
        mockPrisma.rotation.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockRotations as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );
      (
        mockPrisma.logEntry.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockLogEntries as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );

      const result = await getInternProgress('intern1');

      // Check totals
      expect(result.totals.required).toBe(12); // 5 + 3 + 4
      expect(result.totals.logged).toBe(8); // 3 + 2 + 1 + 2
      expect(result.totals.approved).toBe(6); // 3 + 1 + 2
      expect(result.totals.pending).toBe(2); // 2

      // Check rotation progress
      expect(result.rotations).toHaveLength(2);

      const icuRotation = result.rotations.find(
        r => r.rotationId === 'rotation1'
      );
      expect(icuRotation).toBeDefined();
      expect(icuRotation?.required).toBe(8); // 5 + 3
      expect(icuRotation?.logged).toBe(6); // 3 + 2 + 1
      expect(icuRotation?.approved).toBe(4); // 3 + 1
      expect(icuRotation?.pending).toBe(2); // 2
      expect(icuRotation?.completionPct).toBe(0.5); // 4/8
      expect(icuRotation?.noRequirement).toBe(false);

      const pacuRotation = result.rotations.find(
        r => r.rotationId === 'rotation2'
      );
      expect(pacuRotation).toBeDefined();
      expect(pacuRotation?.required).toBe(4);
      expect(pacuRotation?.logged).toBe(2);
      expect(pacuRotation?.approved).toBe(2);
      expect(pacuRotation?.pending).toBe(0);
      expect(pacuRotation?.completionPct).toBe(0.5); // 2/4
    });

    it('should handle rotation with no requirements correctly', async () => {
      const mockRotations = [
        {
          id: 'rotation1',
          name: 'Empty Rotation',
          isActive: true,
          requirements: [], // No requirements
        },
      ];

      const mockLogEntries = [
        {
          id: 'log1',
          count: 5,
          procedure: { id: 'proc1', rotationId: 'rotation1' },
          verification: { status: 'APPROVED' },
        },
      ];

      (
        mockPrisma.rotation.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockRotations as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );
      (
        mockPrisma.logEntry.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockLogEntries as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );

      const result = await getInternProgress('intern1');

      const emptyRotation = result.rotations.find(
        r => r.rotationId === 'rotation1'
      );
      expect(emptyRotation).toBeDefined();
      expect(emptyRotation?.required).toBe(0);
      expect(emptyRotation?.completionPct).toBe(0);
      expect(emptyRotation?.noRequirement).toBe(true);
    });

    it('should cap completion percentage at 100%', async () => {
      const mockRotations = [
        {
          id: 'rotation1',
          name: 'ICU',
          isActive: true,
          requirements: [
            { minCount: 5, procedure: { id: 'proc1', name: 'Arterial Line' } },
          ],
        },
      ];

      const mockLogEntries = [
        {
          id: 'log1',
          count: 10, // More than required
          procedure: { id: 'proc1', rotationId: 'rotation1' },
          verification: { status: 'APPROVED' },
        },
      ];

      (
        mockPrisma.rotation.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockRotations as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );
      (
        mockPrisma.logEntry.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockLogEntries as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );

      const result = await getInternProgress('intern1');

      const rotation = result.rotations.find(r => r.rotationId === 'rotation1');
      expect(rotation?.completionPct).toBe(1); // Capped at 100%
    });
  });

  describe('getTutorProgress', () => {
    it('should return progress for selected intern', async () => {
      const mockIntern = {
        id: 'intern1',
        name: 'Test Intern',
        email: 'test@example.com',
        role: 'INTERN',
      };

      const mockRotations = [
        {
          id: 'rotation1',
          name: 'ICU',
          isActive: true,
          requirements: [
            { minCount: 5, procedure: { id: 'proc1', name: 'Arterial Line' } },
          ],
        },
      ];

      const mockLogEntries = [
        {
          id: 'log1',
          count: 3,
          procedure: { id: 'proc1', rotationId: 'rotation1' },
          verification: { status: 'APPROVED' },
        },
      ];

      (
        mockPrisma.user.findUnique as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockIntern as unknown as { mockResolvedValue: (value: unknown) => void }
      );
      (
        mockPrisma.rotation.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockRotations as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );
      (
        mockPrisma.logEntry.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockLogEntries as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );

      const result = await getTutorProgress('intern1');

      expect(result.selectedInternId).toBe('intern1');
      expect(result.selectedInternName).toBe('Test Intern');
      expect(result.totals.required).toBe(5);
      expect(result.totals.approved).toBe(3);
    });

    it('should use first intern when no internId provided', async () => {
      const mockFirstIntern = {
        id: 'first-intern',
        name: 'First Intern',
        email: 'first@example.com',
        role: 'INTERN',
      };

      (
        mockPrisma.user.findFirst as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockFirstIntern as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );
      (
        mockPrisma.user.findUnique as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockFirstIntern as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );
      (
        mockPrisma.rotation.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue([]);
      (
        mockPrisma.logEntry.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue([]);

      const result = await getTutorProgress();

      expect(result.selectedInternId).toBe('first-intern');
      expect(result.selectedInternName).toBe('First Intern');
    });

    it('should throw error when intern not found', async () => {
      (
        mockPrisma.user.findUnique as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(null);

      await expect(getTutorProgress('nonexistent')).rejects.toThrow(
        'Intern not found'
      );
    });
  });

  describe('getInternsList', () => {
    it('should return list of interns sorted by name', async () => {
      // Mock the sorted result as Prisma would return it
      const mockInterns = [
        { id: '2', name: 'Alice', email: 'alice@example.com' },
        { id: '3', name: 'Bob', email: 'bob@example.com' },
        { id: '1', name: 'Charlie', email: 'charlie@example.com' },
      ];

      (
        mockPrisma.user.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(
        mockInterns as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      );

      const result = await getInternsList();

      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('Alice'); // Should be sorted by name
      expect(result[1]?.name).toBe('Bob');
      expect(result[2]?.name).toBe('Charlie');
    });

    it('should return empty array when no interns found', async () => {
      (
        mockPrisma.user.findMany as unknown as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue([]);

      const result = await getInternsList();

      expect(result).toHaveLength(0);
    });
  });
});
