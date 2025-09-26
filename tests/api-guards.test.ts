import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '@/lib/rbac';
import { getServerSession } from 'next-auth/next';

// Mock getServerSession
const mockGetServerSession = vi.mocked(getServerSession);

describe('requireRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows required role', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1', role: 'INTERN' } });
    const res = await requireRole('INTERN');
    expect(res.ok).toBe(true);
  });

  it('blocks other roles', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'u2', role: 'TUTOR' } });
    const res = await requireRole('ADMIN');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
  });

  it('handles multiple allowed roles', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1', role: 'INTERN' } });
    const res = await requireRole(['INTERN', 'TUTOR']);
    expect(res.ok).toBe(true);
  });
});
