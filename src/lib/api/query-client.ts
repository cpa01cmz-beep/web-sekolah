import { QueryClient } from '@tanstack/react-query';
import { CachingTime, RetryDelay, RetryCount } from '../../config/time';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
  requestId?: string;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CachingTime.FIVE_MINUTES,
      gcTime: CachingTime.TWENTY_FOUR_HOURS,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: ApiError) => {
        if (!error.retryable) return false;
        if (error.status === 404) return false;
        if (error.code === 'VALIDATION_ERROR') return false;
        if (error.code === 'UNAUTHORIZED') return false;
        if (error.code === 'FORBIDDEN') return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) =>
        Math.min(RetryDelay.ONE_SECOND * Math.pow(2, attemptIndex), RetryDelay.THIRTY_SECONDS),
    },
    mutations: {
      retry: (failureCount, error: ApiError) => {
        if (!error.retryable) return false;
        return failureCount < 2;
      },
    },
  },
});
