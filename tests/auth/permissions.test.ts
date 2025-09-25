import { describe, it, expect } from 'vitest';
import { canCreateLog, canReviewLogs, isOwner } from '@/lib/auth/permissions';

describe('Permissions', () => {
  describe('canCreateLog', () => {
    it('should allow INTERN to create logs', () => {
      const intern = { id: '1', role: 'INTERN' };
      expect(canCreateLog(intern)).toBe(true);
    });

    it('should deny TUTOR from creating logs', () => {
      const tutor = { id: '1', role: 'TUTOR' };
      expect(canCreateLog(tutor)).toBe(false);
    });

    it('should deny ADMIN from creating logs', () => {
      const admin = { id: '1', role: 'ADMIN' };
      expect(canCreateLog(admin)).toBe(false);
    });
  });

  describe('canReviewLogs', () => {
    it('should allow TUTOR to review logs', () => {
      const tutor = { id: '1', role: 'TUTOR' };
      expect(canReviewLogs(tutor)).toBe(true);
    });

    it('should allow ADMIN to review logs', () => {
      const admin = { id: '1', role: 'ADMIN' };
      expect(canReviewLogs(admin)).toBe(true);
    });

    it('should deny INTERN from reviewing logs', () => {
      const intern = { id: '1', role: 'INTERN' };
      expect(canReviewLogs(intern)).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true for same user ID', () => {
      expect(isOwner('user1', 'user1')).toBe(true);
    });

    it('should return false for different user IDs', () => {
      expect(isOwner('user1', 'user2')).toBe(false);
    });
  });
});
