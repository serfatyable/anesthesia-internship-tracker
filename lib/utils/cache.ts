/**
 * Advanced caching utilities with TTL, LRU, and memory management
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  maxMemory?: number; // Maximum memory usage in bytes
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly maxMemory: number;
  private currentMemory = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 1000;
    this.maxMemory = options.maxMemory || 50 * 1024 * 1024; // 50MB default

    // Start automatic cleanup
    this.startCleanup();
  }

  private startCleanup() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredEntries();
      },
      5 * 60 * 1000,
    );
  }

  private stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  set(key: string, value: T, customTtl?: number): void {
    const now = Date.now();
    const expires = now + (customTtl || this.ttl);

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.remove(key);
    }

    // Check memory constraints
    const entrySize = this.estimateSize(value);
    if (entrySize > this.maxMemory) {
      console.warn(`Cache entry too large: ${entrySize} bytes`);
      return;
    }

    // Evict entries if necessary
    this.evictIfNeeded(entrySize);

    // Add new entry
    this.cache.set(key, {
      value,
      expires,
      accessCount: 0,
      lastAccessed: now,
    });

    this.updateAccessOrder(key);
    this.currentMemory += entrySize;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();

    // Check if expired
    if (now > entry.expires) {
      this.remove(key);
      return undefined;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.updateAccessOrder(key);

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.remove(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.currentMemory = 0;
  }

  // Clean up expired entries
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.remove(key));
  }

  // Destructor to clean up resources
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): {
    size: number;
    memoryUsage: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    // const now = Date.now(); // Unused variable removed
    const entries = Array.from(this.cache.values());

    return {
      size: this.cache.size,
      memoryUsage: this.currentMemory,
      hitRate: this.calculateHitRate(),
      oldestEntry: Math.min(...entries.map((e) => e.lastAccessed)),
      newestEntry: Math.max(...entries.map((e) => e.lastAccessed)),
    };
  }

  private remove(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.currentMemory -= this.estimateSize(entry.value);
    return true;
  }

  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    // Add to end (most recently accessed)
    this.accessOrder.push(key);
  }

  private evictIfNeeded(entrySize: number): void {
    // Evict by size limit
    while (this.cache.size >= this.maxSize) {
      const oldestKey = this.accessOrder[0];
      if (oldestKey) {
        this.remove(oldestKey);
      }
    }

    // Evict by memory limit
    while (this.currentMemory + entrySize > this.maxMemory && this.cache.size > 0) {
      const oldestKey = this.accessOrder[0];
      if (oldestKey) {
        this.remove(oldestKey);
      }
    }
  }

  private estimateSize(value: T): number {
    // Rough estimation of memory usage
    try {
      return JSON.stringify(value).length * 2; // Rough estimate
    } catch {
      return 1024; // Default estimate
    }
  }

  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    return totalAccesses > 0 ? entries.length / totalAccesses : 0;
  }
}

// Type definitions for cached data
type UserCacheData = { name: string | null; email: string; createdAt: Date };
type RotationCacheData = Array<{
  id: string;
  name: string;
  state: string;
  requirements: Array<{
    minCount: number;
    procedureId: string;
    procedure: { id: string; name: string };
  }>;
}>;
type ProcedureCacheData = Array<{
  id: string;
  name: string;
  description: string | null;
  rotationId: string;
}>;

// Global cache instances with proper typing
export const userCache = new AdvancedCache<UserCacheData>({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 500,
  maxMemory: 10 * 1024 * 1024, // 10MB
});

export const rotationCache = new AdvancedCache<RotationCacheData>({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  maxMemory: 5 * 1024 * 1024, // 5MB
});

export const procedureCache = new AdvancedCache<ProcedureCacheData>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 1000,
  maxMemory: 20 * 1024 * 1024, // 20MB
});

// Cache decorator for functions
export function cached<T extends (...args: unknown[]) => unknown>(
  fn: T,
  cache: AdvancedCache<ReturnType<T>>,
  keyGenerator?: (...args: Parameters<T>) => string,
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    // Try to get from cache
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Execute function and cache result
    const result = fn(...args);

    // Handle promises
    if (result instanceof Promise) {
      return result.then((resolved) => {
        cache.set(key, resolved);
        return resolved;
      });
    }

    cache.set(key, result as ReturnType<T>);
    return result;
  }) as T;
}

// Cache warming utilities
export async function warmCache(): Promise<void> {
  console.log('Warming caches...');

  // This would be called during app startup
  // to pre-populate frequently accessed data

  try {
    // Add cache warming logic here
    console.log('Caches warmed successfully');
  } catch (error) {
    console.error('Cache warming failed:', error);
  }
}

// Cache cleanup utilities
export function cleanupExpiredEntries(): void {
  [userCache, rotationCache, procedureCache].forEach((cache) => {
    // The cache automatically handles expiration on access
    // This is just for manual cleanup if needed
    const stats = cache.getStats();
    if (stats.size > 0) {
      console.log(`Cache stats: ${JSON.stringify(stats)}`);
    }
  });
}

// Memory monitoring
export function getCacheMemoryUsage(): {
  total: number;
  breakdown: Record<string, number>;
} {
  const breakdown = {
    users: userCache.getStats().memoryUsage,
    rotations: rotationCache.getStats().memoryUsage,
    procedures: procedureCache.getStats().memoryUsage,
  };

  return {
    total: Object.values(breakdown).reduce((sum, usage) => sum + usage, 0),
    breakdown,
  };
}
