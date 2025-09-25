import { describe, it, expect } from 'vitest';
import { isAdmin, isTutor, isIntern } from '@/lib/rbac';

describe('RBAC helpers', () => {
  it('detects roles', () => {
    expect(isAdmin('ADMIN')).toBe(true);
    expect(isTutor('TUTOR')).toBe(true);
    expect(isIntern('INTERN')).toBe(true);
    expect(isAdmin('TUTOR')).toBe(false);
    expect(isTutor('INTERN')).toBe(false);
    expect(isIntern('ADMIN')).toBe(false);
  });

  it('handles null/undefined roles', () => {
    expect(isAdmin(null)).toBe(false);
    expect(isTutor(undefined)).toBe(false);
    expect(isIntern(null)).toBe(false);
  });
});
