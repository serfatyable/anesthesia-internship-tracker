import { describe, it, expect } from 'vitest';
import { ProgressService } from '@/lib/services/progressService';

// Simple test for now - we'll add more comprehensive tests later
describe('ProgressService', () => {
  it('should be importable', () => {
    expect(ProgressService).toBeDefined();
    expect(typeof ProgressService).toBe('function');
  });
});
