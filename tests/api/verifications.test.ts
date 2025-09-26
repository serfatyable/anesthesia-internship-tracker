import { describe, it, expect, vi } from 'vitest';
import { getServerSession } from 'next-auth/next';

// Mock getServerSession
const mockGetServerSession = vi.mocked(getServerSession);

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should approve a log entry successfully', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'T1', role: 'TUTOR' } });

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
