import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProgressService } from '@/lib/services/progressService';
import { DashboardOverview, InternDashboard } from '@/lib/domain/progress';

interface UseDashboardReturn {
  dashboard: DashboardOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for dashboard data management
 */
export function useDashboard(): UseDashboardReturn {
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const progressService = new ProgressService();
      const data = await progressService.getDashboardOverview();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refresh: fetchDashboard,
  };
}

interface UseInternProgressReturn {
  progress: InternDashboard | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for intern progress data management
 */
export function useInternProgress(internId: string): UseInternProgressReturn {
  const [progress, setProgress] = useState<InternDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!internId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const progressService = new ProgressService();
      const data = await progressService.getInternProgress(internId);
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  }, [internId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refresh: fetchProgress,
  };
}

/**
 * Hook for managing URL search parameters
 */
export function useUrlParams() {
  const searchParams = useSearchParams();

  const getParam = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(key, value);
      return params.toString();
    },
    [searchParams]
  );

  const removeParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams);
      params.delete(key);
      return params.toString();
    },
    [searchParams]
  );

  return {
    getParam,
    setParam,
    removeParam,
    allParams: searchParams.toString(),
  };
}
