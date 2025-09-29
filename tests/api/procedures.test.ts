import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/procedures/route';

// Mock the logs service
vi.mock('@/lib/services/logs', () => ({
  listProceduresActive: vi.fn(),
}));

describe('Procedures API', () => {
  let mockListProceduresActive: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { listProceduresActive } = await import('@/lib/services/logs');
    mockListProceduresActive = listProceduresActive;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/procedures', () => {
    it('should return procedures successfully', async () => {
      const mockProcedures = [
        {
          id: 'proc1',
          name: 'Intubation',
          description: 'Endotracheal intubation procedure',
          category: 'Airway',
          isActive: true,
        },
        {
          id: 'proc2',
          name: 'Central Line',
          description: 'Central venous catheter insertion',
          category: 'Vascular',
          isActive: true,
        },
      ];

      mockListProceduresActive.mockResolvedValue(mockProcedures);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.procedures).toEqual(mockProcedures);
      expect(mockListProceduresActive).toHaveBeenCalledOnce();
    });

    it('should return empty array when no procedures', async () => {
      mockListProceduresActive.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.procedures).toEqual([]);
      expect(mockListProceduresActive).toHaveBeenCalledOnce();
    });

    it('should handle database errors', async () => {
      mockListProceduresActive.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle service errors', async () => {
      mockListProceduresActive.mockRejectedValue(
        new Error('Service unavailable')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle null response from service', async () => {
      mockListProceduresActive.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.procedures).toBeNull();
    });

    it('should handle undefined response from service', async () => {
      mockListProceduresActive.mockResolvedValue(undefined);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.procedures).toBeUndefined();
    });
  });
});
