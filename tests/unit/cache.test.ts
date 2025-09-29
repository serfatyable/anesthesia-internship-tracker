import { describe, it, expect, vi } from 'vitest';
import { getCacheHeaders, debounce } from '@/lib/optimization/cache';

describe('Cache Utilities', () => {
  describe('getCacheHeaders', () => {
    it('returns correct headers for DYNAMIC cache', () => {
      const headers = getCacheHeaders('DYNAMIC');
      
      expect(headers).toEqual({
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      });
    });

    it('returns correct headers for SEMI_STATIC cache', () => {
      const headers = getCacheHeaders('SEMI_STATIC');
      
      expect(headers).toEqual({
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      });
    });

    it('returns correct headers for STATIC cache', () => {
      const headers = getCacheHeaders('STATIC');
      
      expect(headers).toEqual({
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      });
    });
  });

  describe('debounce', () => {
    it('delays function execution', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('cancels previous calls when called multiple times', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('preserves function arguments', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('arg1', 'arg2', 'arg3');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('maintains correct context', async () => {
      const context = { value: 'test' };
      const mockFn = vi.fn(function(this: any) {
        return this.value;
      });
      
      const debouncedFn = debounce(mockFn.bind(context), 100);
      
      debouncedFn();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFn).toHaveBeenCalled();
    });
  });
});
