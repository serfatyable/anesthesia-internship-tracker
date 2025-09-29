/**
 * In-memory cache implementation
 * Simple fallback cache for development and small-scale production
 */
import { logger } from '@/lib/utils/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

interface CacheEntry {
  value: unknown;
  expires: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTtl = 300; // 5 minutes
  private prefix = 'app';

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.ttl || this.defaultTtl;
    this.prefix = options.prefix || this.prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expires;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry) {
        return null;
      }

      if (this.isExpired(entry)) {
        this.cache.delete(fullKey);
        return null;
      }

      return entry.value as T;
    } catch (error) {
      logger.error('Cache get error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      const expires = Date.now() + (ttl || this.defaultTtl) * 1000;

      this.cache.set(fullKey, { value, expires });
    } catch (error) {
      logger.error('Cache set error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      this.cache.delete(fullKey);
    } catch (error) {
      logger.error('Cache delete error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear();
    } catch (error) {
      logger.error('Cache clear error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    try {
      const allKeys = Array.from(this.cache.keys());

      if (!pattern) {
        return allKeys.map((key) => key.replace(`${this.prefix}:`, ''));
      }

      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return allKeys
        .filter((key) => regex.test(key))
        .map((key) => key.replace(`${this.prefix}:`, ''));
    } catch (error) {
      logger.error('Cache keys error', {
        pattern: pattern || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry) {
        return false;
      }

      if (this.isExpired(entry)) {
        this.cache.delete(fullKey);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Cache exists error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async getStats(): Promise<{
    isConnected: boolean;
    type: 'memory';
    size: number;
    memoryUsage?: number;
  }> {
    try {
      // Clean up expired entries
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
        }
      }

      return {
        isConnected: true,
        type: 'memory',
        size: this.cache.size,
        memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
      };
    } catch (error) {
      logger.error('Cache stats error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        isConnected: false,
        type: 'memory',
        size: 0,
      };
    }
  }

  // Cleanup expired entries
  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    cache.cleanup();
  },
  5 * 60 * 1000,
);

export { MemoryCache };
export type { CacheOptions };
