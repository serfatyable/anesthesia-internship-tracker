import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/session/route';

// Mock NextAuth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('Session API', () => {
  let mockGetServerSession: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { getServerSession } = await import('next-auth/next');
    mockGetServerSession = getServerSession;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/session', () => {
    it('should return user data when authenticated', async () => {
      const mockSession = {
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'INTERN',
        },
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'INTERN',
        },
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when session has no user', async () => {
      mockGetServerSession.mockResolvedValue({});

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle server errors', async () => {
      mockGetServerSession.mockRejectedValue(new Error('Server error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.message).toBe('Server error');
    });

    it('should handle unknown errors', async () => {
      mockGetServerSession.mockRejectedValue('Unknown error');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.message).toBe('Unknown error');
    });

    it('should handle user with null role', async () => {
      const mockSession = {
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: null,
        },
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: null,
        },
      });
    });

    it('should handle user with undefined role', async () => {
      const mockSession = {
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          role: undefined,
        },
      });
    });
  });
});
