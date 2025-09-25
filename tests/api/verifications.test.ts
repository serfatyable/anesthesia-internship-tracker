import { describe, it, expect, vi } from 'vitest';

// Mock next-auth session to be a TUTOR
vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'T1', role: 'TUTOR' } }),
}));

// Provide an authOptions export for the route to import
vi.mock('@/lib/auth/options', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    authOptions: {} as Record<string, unknown>, // route only needs it passed into getServerSession mock
  };
});

// Minimal prisma mocks used by the verifications route
vi.mock('@/lib/db', () => ({
  prisma: {
    verification: {
      create: vi.fn().mockResolvedValue({ id: 'V1', status: 'APPROVED' }),
      update: vi.fn().mockResolvedValue({ id: 'V1', status: 'APPROVED' }),
    },
    logEntry: {
      findFirst: vi.fn().mockResolvedValue({ id: 'L1', internId: 'I1', procedureId: 'P1' }),
      findUnique: vi.fn().mockResolvedValue({
        id: 'L1',
        internId: 'I1',
        procedureId: 'P1',
        verification: { id: 'V1', status: 'PENDING' },
      }),
      update: vi.fn().mockResolvedValue({ id: 'L1' }),
    },
  },
}));

import { POST } from '../../app/api/verifications/route';

describe('POST /api/verifications', () => {
  it('should approve a log entry successfully', async () => {
    const req = new Request('http://test/api/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logEntryId: 'L1', status: 'APPROVED', reason: 'ok' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload).toBeDefined();
  });
});
