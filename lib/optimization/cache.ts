/**
 * Cache optimization utilities
 */

export const CACHE_CONFIG = {
  DYNAMIC: { maxAge: 60, sMaxAge: 300 },
  SEMI_STATIC: { maxAge: 300, sMaxAge: 3600 },
  STATIC: { maxAge: 3600, sMaxAge: 86400 },
} as const;

export function getCacheHeaders(type: keyof typeof CACHE_CONFIG) {
  const config = CACHE_CONFIG[type];
  return {
    'Cache-Control': `public, max-age=${config.maxAge}, s-maxage=${config.sMaxAge}`,
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
