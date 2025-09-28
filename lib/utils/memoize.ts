/**
 * Simple memoization utility for expensive pure functions
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = fn(...args);
    cache.set(key, result as ReturnType<T>);
    return result;
  }) as T;
}

/**
 * Memoization with TTL (time-to-live) for cache invalidation
 */
export function memoizeWithTTL<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ttlMs: number,
  keyGenerator?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, { value: ReturnType<T>; expiry: number }>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && cached.expiry > now) {
      return cached.value as ReturnType<T>;
    }

    const result = fn(...args);
    cache.set(key, { value: result as ReturnType<T>, expiry: now + ttlMs });
    return result;
  }) as T;
}
