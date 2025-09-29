import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '@/lib/rbac';

// mock getServerSession used in requireRole
vi.mock('next-auth/next', () => ({
  getServerSession: vi
    .fn()
    .mockResolvedValue({ user: { id: 'u1', role: 'INTERN' } }),
}));

describe('requireRole', () => {
  it('allows required role', async () => {
    const res = await requireRole('INTERN');
    expect(res.ok).toBe(true);
  });

  it('blocks other roles', async () => {
    // temporarily mock to TUTOR
    const { getServerSession } = await import('next-auth/next');
    (
      getServerSession as unknown as {
        mockResolvedValueOnce: (value: unknown) => void;
      }
    ).mockResolvedValueOnce({ user: { id: 'u2', role: 'TUTOR' } });
    const res = await requireRole('ADMIN');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
  });

  it('handles multiple allowed roles', async () => {
    const res = await requireRole(['INTERN', 'TUTOR']);
    expect(res.ok).toBe(true);
  });
});
