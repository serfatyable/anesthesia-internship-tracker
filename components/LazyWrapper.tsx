'use client';

import { useCallback, useState } from 'react';

/**
 * Hook for dynamic imports with loading states
 */
export function useLazyImport<T = unknown>(importFn: () => Promise<T>) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component || loading) return;

    setLoading(true);
    setError(null);

    try {
      const moduleResult = await importFn();
      setComponent(moduleResult);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load component')
      );
    } finally {
      setLoading(false);
    }
  }, [Component, loading, importFn]);

  return { Component, loading, error, loadComponent };
}
