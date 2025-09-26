/**
 * Comprehensive caching service for both server-side and client-side caching
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // Cache tags for invalidation
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidateByTag(): void {
    // In a real implementation, you'd track tags
    // For now, we'll clear all cache
    this.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export class CacheService {
  private memoryCache = new MemoryCache();
  private cachePrefix = 'anesthesia_tracker:';

  /**
   * Generate cache key with prefix
   */
  private getKey(key: string): string {
    return `${this.cachePrefix}${key}`;
  }

  /**
   * Set cache item
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    this.memoryCache.set(this.getKey(key), data, options);
  }

  /**
   * Get cache item
   */
  get<T>(key: string): T | null {
    return this.memoryCache.get<T>(this.getKey(key));
  }

  /**
   * Delete cache item
   */
  delete(key: string): boolean {
    return this.memoryCache.delete(this.getKey(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
  }

  /**
   * Invalidate cache by tags
   */
  invalidateByTag(): void {
    this.memoryCache.invalidateByTag();
  }

  /**
   * Cache progress data
   */
  async cacheProgressData(userId: string, data: unknown, ttl: number = 300000): Promise<void> {
    this.set(`progress:${userId}`, data, { ttl, tags: ['progress', `user:${userId}`] });
  }

  /**
   * Get cached progress data
   */
  async getCachedProgressData(userId: string): Promise<unknown | null> {
    return this.get(`progress:${userId}`);
  }

  /**
   * Cache verification queue
   */
  async cacheVerificationQueue(data: unknown, ttl: number = 60000): Promise<void> {
    this.set('verification:queue', data, { ttl, tags: ['verification'] });
  }

  /**
   * Get cached verification queue
   */
  async getCachedVerificationQueue(): Promise<unknown | null> {
    return this.get('verification:queue');
  }

  /**
   * Cache admin data
   */
  async cacheAdminData(data: unknown, ttl: number = 300000): Promise<void> {
    this.set('admin:dashboard', data, { ttl, tags: ['admin'] });
  }

  /**
   * Get cached admin data
   */
  async getCachedAdminData(): Promise<unknown | null> {
    return this.get('admin:dashboard');
  }

  /**
   * Cache user data
   */
  async cacheUserData(userId: string, data: unknown, ttl: number = 600000): Promise<void> {
    this.set(`user:${userId}`, data, { ttl, tags: ['user', `user:${userId}`] });
  }

  /**
   * Get cached user data
   */
  async getCachedUserData(userId: string): Promise<unknown | null> {
    return this.get(`user:${userId}`);
  }

  /**
   * Cache procedures and requirements
   */
  async cacheProceduresAndRequirements(data: unknown, ttl: number = 1800000): Promise<void> {
    this.set('procedures:requirements', data, { ttl, tags: ['procedures', 'requirements'] });
  }

  /**
   * Get cached procedures and requirements
   */
  async getCachedProceduresAndRequirements(): Promise<unknown | null> {
    return this.get('procedures:requirements');
  }

  /**
   * Invalidate user-related cache
   */
  invalidateUserCache(userId: string): void {
    this.delete(`progress:${userId}`);
    this.delete(`user:${userId}`);
    this.invalidateByTag();
  }

  /**
   * Invalidate verification cache
   */
  invalidateVerificationCache(): void {
    this.delete('verification:queue');
    this.invalidateByTag();
  }

  /**
   * Invalidate admin cache
   */
  invalidateAdminCache(): void {
    this.delete('admin:dashboard');
    this.invalidateByTag();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size(),
      keys: Array.from(this.memoryCache['cache'].keys()).map((key) =>
        key.replace(this.cachePrefix, ''),
      ),
    };
  }
}

export const cacheService = new CacheService();

/**
 * Cache decorator for functions
 */
export function cached<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  options: CacheOptions = {},
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cacheService.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cacheService.set(key, result, options);
    return result;
  }) as T;
}
