import { useMemo } from 'react';

export function useChartData<T extends Record<string, unknown>>(
  data: T[] | undefined,
  isLoading: boolean,
  error: Error | null
) {
  return useMemo(() => {
    if (isLoading) return { status: 'loading' as const, data: null };
    if (error) return { status: 'error' as const, data: null };
    if (!data || data.length === 0) return { status: 'empty' as const, data: null };
    return { status: 'ready' as const, data };
  }, [data, isLoading, error]);
}
