import { describe, it, expect, vi } from 'vitest';

// Mock the service used by the route
vi.mock('@/lib/services/progressService', () => ({
  progressService: {
    getInternProgress: vi.fn().mockResolvedValue({
      summary: { totalRequired: 1, totalVerified: 0, totalPending: 1, completionPercentage: 0 },
      rotations: [],
      pendingVerifications: [],
      recentActivity: [],
    }),
    getDashboardOverview: vi.fn().mockResolvedValue({
      totalInterns: 1,
      totalPendingVerifications: 1,
      last7DaysActivity: 5,
      interns: [],
    }),
  },
}));

// Mock NextAuth
vi.mock('next-auth/next', () => {
  return {
    getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user-1', role: 'INTERN' } }),
  };
});

describe('GET /api/progress', () => {
  it('returns 200 on success', async () => {
    // Use relative import to avoid Vitest alias edge cases
    const { GET } = await import('../../app/api/progress/route');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(new Request('http://test/api/progress') as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary.totalRequired).toBe(1);
  });
});
