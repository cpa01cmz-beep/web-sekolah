// ====================
// API Client with React Query Integration
// ====================

import { QueryClient, useQuery as useTanstackQuery, useMutation as useTanstackMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiResponse } from "../../shared/types";
import { mapStatusToErrorCode } from '../../shared/error-utils';
import { CachingTime, ApiTimeout, RetryDelay, RetryCount, CircuitBreakerConfig } from '../config/time';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { storage } from '../lib/storage';
import { CircuitBreaker, type CircuitBreakerState } from '@shared/CircuitBreaker';
import { withRetry } from './resilience/Retry';

const getAuthToken = () => storage.getItem(STORAGE_KEYS.AUTH_TOKEN);

// ====================
// Type Definitions
// ====================

interface ApiError extends Error {
  status?: number;
  code?: string;
  retryable?: boolean;
  requestId?: string;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  circuitBreaker?: boolean;
}

const circuitBreaker = new CircuitBreaker('api-client', {
  failureThreshold: CircuitBreakerConfig.FAILURE_THRESHOLD,
  timeoutMs: CircuitBreakerConfig.TIMEOUT_MS,
});

// ====================
// Exponential Backoff Retry
// ====================

// ====================
// Query Client Configuration
// ====================

/**
 * Centralized QueryClient instance with default configuration
 * Configures stale time, gc time, and retry behavior for all queries
 */
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
      retryDelay: (attemptIndex) => Math.min(RetryDelay.ONE_SECOND * Math.pow(2, attemptIndex), RetryDelay.THIRTY_SECONDS),
    },
    mutations: {
      retry: (failureCount, error: ApiError) => {
        if (!error.retryable) return false;
        return failureCount < 2;
      },
    },
  },
});

// ====================
// Core API Client Function
// ====================

/**
 * Fetch with timeout support
 * @template T - The expected response data type
 * @param url - The URL to fetch
 * @param options - Request options including timeout
 * @returns The response
 * @throws Error if the request times out
 */
async function fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
  const { timeout = ApiTimeout.THIRTY_SECONDS, ...restOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...restOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout') as ApiError;
      timeoutError.code = 'TIMEOUT';
      timeoutError.status = 408;
      timeoutError.retryable = true;
      throw timeoutError;
    }
    throw error;
  }
}

/**
 * Generic API client function that handles requests and responses
 * with timeout, exponential backoff, and circuit breaker support
 * @template T - The expected response data type
 * @param path - The API endpoint path
 * @param init - Request initialization options
 * @returns The response data
 * @throws Error if the request fails or returns an unsuccessful response
 */
export async function apiClient<T>(path: string, init?: RequestInit & { timeout?: number; circuitBreaker?: boolean }): Promise<T> {
  const { headers: initHeaders, timeout = ApiTimeout.THIRTY_SECONDS, circuitBreaker: useCircuitBreaker = true, ...restInit } = init || {};
  const requestId = crypto.randomUUID();

    const executeRequest = async (): Promise<T> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...initHeaders as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetchWithTimeout(path, {
      timeout,
      headers,
      ...restInit,
    });

    const requestIdHeader = res.headers.get('X-Request-ID');

    if (!res.ok) {
      let errorJson: Record<string, unknown> = {};
      try {
        errorJson = await res.json().catch(() => ({}));
      } catch {
        errorJson = {};
      }
      
      const error = new Error(errorJson.error as string || `Request failed with status ${res.status}`) as ApiError;
      error.status = res.status;
      error.code = (errorJson.code as string) || mapStatusToErrorCode(res.status);
      error.requestId = requestIdHeader || requestId;
      
      if (res.status === 429) {
        error.retryable = true;
      } else if (res.status >= 500 && res.status < 600) {
        error.retryable = true;
      } else if (res.status === 408) {
        error.retryable = true;
      } else {
        error.retryable = false;
      }
      
      throw error;
    }

    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) {
      const error = new Error(json.error || 'API request failed') as ApiError;
      error.code = (json.code as string) || mapStatusToErrorCode(res.status);
      error.requestId = requestIdHeader || requestId;
      throw error;
    }

    if (json.data === undefined) {
      const error = new Error('API response missing data field') as ApiError;
      error.code = 'INTERNAL_SERVER_ERROR';
      error.status = res.status;
      error.requestId = requestIdHeader || requestId;
      throw error;
    }

    return json.data;
  };

  if (useCircuitBreaker) {
    return circuitBreaker.execute(() =>
      withRetry(executeRequest, {
        maxRetries: RetryCount.THREE,
        baseDelay: RetryDelay.ONE_SECOND,
        jitterMs: RetryDelay.ONE_SECOND,
        shouldRetry: (error) => {
          const apiError = error as ApiError;
          return apiError.retryable ?? false;
        }
      })
    );
  }

  return withRetry(executeRequest, {
    maxRetries: RetryCount.THREE,
    baseDelay: RetryDelay.ONE_SECOND,
    jitterMs: RetryDelay.ONE_SECOND,
    shouldRetry: (error) => {
      const apiError = error as ApiError;
      return apiError.retryable ?? false;
    }
  });
}

export function getCircuitBreakerState(): CircuitBreakerState {
  return circuitBreaker.getState();
}

export function resetCircuitBreaker(): void {
  circuitBreaker.reset();
}

// ====================
// Custom React Query Hooks
// ====================

type QueryKey = readonly unknown[];

  interface QueryOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  timeout?: number;
  circuitBreaker?: boolean;
}

  interface ExtendedMutationOptions<TData, TError, TVariables> extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationKey' | 'mutationFn'> {
    method?: string;
    timeout?: number;
    circuitBreaker?: boolean;
  }

/**
 * Custom hook for data fetching with automatic API path construction
 * @template TData - The expected response data type
 * @template TError - The error type
 * @param queryKey - The query key used for caching and deduplication
 * @param options - Additional query options
 * @returns React Query result object
 */
export function useQuery<TData, TError = Error>(
  queryKey: QueryKey,
  options?: QueryOptions<TData, TError>
) {
  const { timeout = ApiTimeout.THIRTY_SECONDS, circuitBreaker = true, ...restOptions } = options || {};
  
  const queryFn = () => apiClient<TData>(`/api/${queryKey.join('/')}`, {
    timeout,
    circuitBreaker,
  });
  
  return useTanstackQuery<TData, TError>({
    queryKey,
    queryFn,
    ...restOptions,
  });
}

/**
 * Custom hook for data mutations with automatic API path construction
 * @template TData - The expected response data type
 * @template TError - The error type
 * @template TVariables - The variables type for the mutation
 * @param mutationKey - The mutation key used for caching
 * @param options - Additional mutation options
 * @returns React Query mutation result object
 */
export function useMutation<TData, TError = Error, TVariables = void>(
  mutationKey: QueryKey,
  options?: ExtendedMutationOptions<TData, TError, TVariables>
) {
  const { 
    timeout = ApiTimeout.THIRTY_SECONDS, 
    circuitBreaker = true, 
    method = 'POST', 
    ...restOptions 
  } = options || {};
  
  const mutationFn = async (variables: TVariables) => {
    const path = `/api/${mutationKey.join('/')}`;
    const body = method !== 'GET' && method !== 'DELETE' ? JSON.stringify(variables) : undefined;
    return apiClient<TData>(path, { method, body, timeout, circuitBreaker });
  };
  
  return useTanstackMutation<TData, TError, TVariables>({
    mutationKey,
    mutationFn,
    ...restOptions,
  });
}
