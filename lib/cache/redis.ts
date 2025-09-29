/**
 * Redis cache implementation for production use
 * Falls back to in-memory cache in development
 */
import { createClient, RedisClientType } from 'redis';
import { logger } from '@/lib/utils/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

class RedisCache {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private fallbackCache = new Map<string, { value: any; expires: number }>();

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.client = createClient({
          url: process.env.REDIS_URL,
          socket: {
            connectTimeout: 5000,
            lazyConnect: true,
          },
        });

        this.client.on('error', (error: Error) => {
          logger.error('Redis connection error', { error: error.message });
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          logger.info('Redis connected successfully');
          this.isConnected = true;
        });

        await this.client.connect();
      } else {
        logger.warn('Redis URL not provided, using in-memory cache');
      }
    } catch (error) {
      logger.error('Failed to initialize Redis', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.isConnected = false;
    }
  }

  private getKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || 'app';
    return `${keyPrefix}:${key}`;
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (this.client && this.isConnected) {
        const value = await this.client.get(fullKey);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to in-memory cache
        const entry = this.fallbackCache.get(fullKey);
        if (entry && entry.expires > Date.now()) {
          return entry.value;
        }
        if (entry) {
          this.fallbackCache.delete(fullKey);
        }
        return null;
      }
    } catch (error) {
      logger.error('Cache get error', {
        key: fullKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getKey(key, options.prefix);
    const ttl = options.ttl || 3600; // Default 1 hour

    try {
      if (this.client && this.isConnected) {
        await this.client.setEx(fullKey, ttl, JSON.stringify(value));
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(fullKey, {
          value,
          expires: Date.now() + ttl * 1000,
        });
      }
    } catch (error) {
      logger.error('Cache set error', {
        key: fullKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (this.client && this.isConnected) {
        await this.client.del(fullKey);
      } else {
        this.fallbackCache.delete(fullKey);
      }
    } catch (error) {
      logger.error('Cache delete error', {
        key: fullKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (this.client && this.isConnected) {
        const result = await this.client.exists(fullKey);
        return result === 1;
      } else {
        const entry = this.fallbackCache.get(fullKey);
        return entry ? entry.expires > Date.now() : false;
      }
    } catch (error) {
      logger.error('Cache exists error', {
        key: fullKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        if (pattern) {
          const keys = await this.client.keys(pattern);
          if (keys.length > 0) {
            await this.client.del(keys);
          }
        } else {
          await this.client.flushAll();
        }
      } else {
        if (pattern) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          for (const key of this.fallbackCache.keys()) {
            if (regex.test(key)) {
              this.fallbackCache.delete(key);
            }
          }
        } else {
          this.fallbackCache.clear();
        }
      }
    } catch (error) {
      logger.error('Cache clear error', {
        pattern,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getStats(): Promise<{
    isConnected: boolean;
    type: 'redis' | 'memory';
    size: number;
    memoryUsage?: number;
  }> {
    try {
      if (this.client && this.isConnected) {
        const info = await this.client.info('memory');
        const memoryUsage = info.match(/used_memory:(\d+)/)?.[1];

        return {
          isConnected: true,
          type: 'redis',
          size: await this.client.dbSize(),
          memoryUsage: memoryUsage ? parseInt(memoryUsage) : undefined,
        };
      } else {
        return {
          isConnected: false,
          type: 'memory',
          size: this.fallbackCache.size,
        };
      }
    } catch (error) {
      logger.error('Cache stats error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        isConnected: false,
        type: 'memory',
        size: this.fallbackCache.size,
      };
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.disconnect();
        this.isConnected = false;
      }
    } catch (error) {
      logger.error('Cache disconnect error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Global cache instance
export const redisCache = new RedisCache();

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  options: CacheOptions = {},
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    // Try to get from cache
    const cached = await redisCache.get(key, options);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    await redisCache.set(key, result, options);

    return result;
  }) as T;
}

// Cache warming utilities
export async function warmCache(): Promise<void> {
  logger.info('Warming cache...');

  try {
    // Warm frequently accessed data
    // This would be called during app startup

    logger.info('Cache warmed successfully');
  } catch (error) {
    logger.error('Cache warming failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Cache cleanup utilities
export async function cleanupExpiredCache(): Promise<void> {
  try {
    // Redis handles expiration automatically
    // For in-memory cache, we need to clean up manually
    if (!redisCache['isConnected']) {
      const now = Date.now();
      for (const [key, entry] of redisCache['fallbackCache'].entries()) {
        if (entry.expires < now) {
          redisCache['fallbackCache'].delete(key);
        }
      }
    }
  } catch (error) {
    logger.error('Cache cleanup failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
