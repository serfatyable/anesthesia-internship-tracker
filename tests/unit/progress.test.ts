import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    rotation: {
      findMany: vi.fn(),
    },
    logEntry: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    verification: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));
import { ProgressService } from '@/lib/services/progressService';
import {
  calculateCompletionPercentage,
  formatDateForDisplay,
  formatDateForCSV,
} from '@/lib/domain/progress';
// prisma import after vi.mock so it resolves to the mocked module
import { prisma } from '@/lib/db';

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('ProgressService', () => {
  let progressService: ProgressService;

  beforeEach(() => {
    progressService = new ProgressService();
  });

  describe('getInternProgress', () => {
    it('should calculate progress correctly for a single rotation', async () => {
      const mockRotations = [
        {
          id: 'rotation-1',
          name: 'ICU',
          description: 'Intensive Care Unit',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          requirements: [
            { minCount: 10, procedure: { id: 'proc-1', name: 'Intubation' } },
            { minCount: 5, procedure: { id: 'proc-2', name: 'Central Line' } },
          ],
        },
      ];

      const mockLogEntries = [
        {
          id: 'log-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          internId: 'user-1',
          procedureId: 'proc-1',
          date: new Date(),
          count: 8,
          notes: null,
          verification: { status: 'APPROVED' },
          procedure: { rotationId: 'rotation-1', name: 'Intubation' },
        },
        {
          id: 'log-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          internId: 'user-1',
          procedureId: 'proc-2',
          date: new Date(),
          count: 3,
          notes: null,
          verification: { status: 'PENDING' },
          procedure: { rotationId: 'rotation-1', name: 'Central Line' },
        },
      ];

      vi.mocked(prisma.rotation.findMany).mockResolvedValue(mockRotations);
      vi.mocked(prisma.logEntry.findMany).mockResolvedValue(mockLogEntries);
      vi.mocked(prisma.verification.findMany).mockResolvedValue([]);

      const result = await progressService.getInternProgress('user-1');

      expect(result).toBeDefined();
      expect(result!.summary.totalRequired).toBe(15);
      expect(result!.summary.totalVerified).toBe(8);
      expect(result!.summary.totalPending).toBe(3);
      expect(result!.summary.completionPercentage).toBe(53);

      expect(result!.rotations).toHaveLength(1);
      expect(result!.rotations[0]!.rotationName).toBe('ICU');
      expect(result!.rotations[0]!.required).toBe(15);
      expect(result!.rotations[0]!.verified).toBe(8);
      expect(result!.rotations[0]!.pending).toBe(3);
      expect(result!.rotations[0]!.completionPercentage).toBe(53);
    });

    it('should handle multiple rotations correctly', async () => {
      const mockRotations = [
        {
          id: 'rotation-1',
          name: 'ICU',
          description: 'Intensive Care Unit',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          requirements: [{ minCount: 10, procedure: { id: 'proc-1', name: 'Intubation' } }],
        },
        {
          id: 'rotation-2',
          name: 'OR',
          description: 'Operating Room',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          requirements: [{ minCount: 5, procedure: { id: 'proc-2', name: 'Surgery' } }],
        },
      ];

      const mockLogEntries = [
        {
          id: 'log-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          internId: 'user-1',
          procedureId: 'proc-1',
          date: new Date(),
          count: 10,
          notes: null,
          verification: { status: 'APPROVED' },
          procedure: { rotationId: 'rotation-1', name: 'Intubation' },
        },
        {
          id: 'log-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          internId: 'user-1',
          procedureId: 'proc-2',
          date: new Date(),
          count: 3,
          notes: null,
          verification: { status: 'APPROVED' },
          procedure: { rotationId: 'rotation-2', name: 'Surgery' },
        },
      ];

      vi.mocked(prisma.rotation.findMany).mockResolvedValue(mockRotations);
      vi.mocked(prisma.logEntry.findMany).mockResolvedValue(mockLogEntries);
      vi.mocked(prisma.verification.findMany).mockResolvedValue([]);

      const result = await progressService.getInternProgress('user-1');

      expect(result).toBeDefined();
      expect(result!.summary.totalRequired).toBe(15);
      expect(result!.summary.totalVerified).toBe(13);
      expect(result!.summary.totalPending).toBe(0);
      expect(result!.summary.completionPercentage).toBe(87);

      expect(result!.rotations).toHaveLength(2);
      expect(result!.rotations[0]!.completionPercentage).toBe(100); // ICU complete
      expect(result!.rotations[1]!.completionPercentage).toBe(60); // OR 60% complete (3/5)
    });

    it('should handle empty data gracefully', async () => {
      vi.mocked(prisma.rotation.findMany).mockResolvedValue([]);
      vi.mocked(prisma.logEntry.findMany).mockResolvedValue([]);
      vi.mocked(prisma.verification.findMany).mockResolvedValue([]);

      const result = await progressService.getInternProgress('user-1');

      expect(result).toBeDefined();
      expect(result!.summary.totalRequired).toBe(0);
      expect(result!.summary.totalVerified).toBe(0);
      expect(result!.summary.totalPending).toBe(0);
      expect(result!.summary.completionPercentage).toBe(100);
      expect(result!.rotations).toHaveLength(0);
    });
  });

  describe('getDashboardOverview', () => {
    it('should return overview data correctly', async () => {
      const mockInterns = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          role: 'INTERN',
          password: 'hashed-password',
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          role: 'INTERN',
          password: 'hashed-password',
        },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockInterns);
      vi.mocked(prisma.verification.count).mockResolvedValue(5);
      vi.mocked(prisma.logEntry.count).mockResolvedValue(25);

      // Mock getInternProgress for each user
      vi.spyOn(progressService, 'getInternProgress')
        .mockResolvedValueOnce({
          summary: {
            totalRequired: 100,
            totalVerified: 80,
            totalPending: 5,
            totalOverAchieved: 0,
            completionPercentage: 80,
            overAchievementPercentage: 0,
          },
          rotations: [],
          pendingVerifications: [],
          recentActivity: [],
        })
        .mockResolvedValueOnce({
          summary: {
            totalRequired: 100,
            totalVerified: 60,
            totalPending: 10,
            totalOverAchieved: 0,
            completionPercentage: 60,
            overAchievementPercentage: 0,
          },
          rotations: [],
          pendingVerifications: [],
          recentActivity: [],
        });

      const result = await progressService.getDashboardOverview();

      expect(result).toBeDefined();
      expect(result!.totalInterns).toBe(2);
      expect(result!.totalPendingVerifications).toBe(5);
      expect(result!.last7DaysActivity).toBe(25);
      expect(result!.interns).toHaveLength(2);
      expect(result!.interns[0]!.name).toBe('John Doe');
      expect(result!.interns[0]!.completionPercentage).toBe(80);
    });
  });

  describe('exportLogs', () => {
    it('should export logs with correct format', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          internId: 'user-1',
          procedureId: 'proc-1',
          intern: { name: 'John Doe' },
          procedure: { name: 'Intubation', rotation: { name: 'ICU' } },
          date: new Date('2024-01-15'),
          count: 2,
          notes: 'First attempt',
          verification: {
            status: 'APPROVED',
            verifier: { name: 'Dr. Smith' },
            timestamp: new Date('2024-01-16'),
            reason: null,
          },
        },
      ];

      vi.mocked(prisma.logEntry.findMany).mockResolvedValue(mockLogs);

      const result = await progressService.exportLogs({ userId: 'user-1' });

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result![0]!.id).toBe('log-1');
      expect(result![0]!.internName).toBe('John Doe');
      expect(result![0]!.procedureName).toBe('Intubation');
      expect(result![0]!.rotationName).toBe('ICU');
      expect(result![0]!.date).toBe('2024-01-15');
      expect(result![0]!.count).toBe(2);
      expect(result![0]!.notes).toBe('First attempt');
      expect(result![0]!.status).toBe('APPROVED');
      expect(result![0]!.verifiedBy).toBe('Dr. Smith');
      expect(result![0]!.verifiedAt).toBe('2024-01-16');
    });

    it('should generate CSV content correctly', () => {
      const mockRows = [
        {
          id: 'log-1',
          internName: 'John Doe',
          procedureName: 'Intubation',
          rotationName: 'ICU',
          date: '2024-01-15',
          count: 2,
          notes: 'First attempt',
          status: 'APPROVED' as const,
          verifiedBy: 'Dr. Smith',
          verifiedAt: '2024-01-16',
          reason: undefined as string | undefined,
        },
      ];

      const csvContent = progressService.generateCSVContent(mockRows);

      expect(csvContent).toContain('"ID","Intern Name","Procedure Name"');
      expect(csvContent).toContain('"log-1","John Doe","Intubation"');
      expect(csvContent).toContain('"ICU","2024-01-15","2"');
    });
  });
});

describe('Progress Domain Helpers', () => {
  describe('calculateCompletionPercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateCompletionPercentage(50, 100)).toBe(50);
      expect(calculateCompletionPercentage(75, 100)).toBe(75);
      expect(calculateCompletionPercentage(100, 100)).toBe(100);
      expect(calculateCompletionPercentage(150, 100)).toBe(100); // Cap at 100%
    });

    it('should handle zero required count', () => {
      expect(calculateCompletionPercentage(0, 0)).toBe(100);
      expect(calculateCompletionPercentage(10, 0)).toBe(100);
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDateForDisplay(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });
  });

  describe('formatDateForCSV', () => {
    it('should format date for CSV correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDateForCSV(date);
      expect(formatted).toBe('2024-01-15');
    });
  });
});
