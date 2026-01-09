// ====================
// API Client with React Query Integration
// ====================

import { QueryClient, useQuery as useTanstackQuery, useMutation as useTanstackMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiResponse, ErrorCode } from "../../shared/types";
import { CachingTime, ApiTimeout, RetryDelay, RetryCount, CircuitBreakerConfig } from '../config/time';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { storage } from '../lib/storage';
import { CircuitBreaker, type CircuitBreakerState } from './resilience/CircuitBreaker';

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

interface MutationOptions<TData, TError, TVariables> extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationKey' | 'mutationFn'> {
  method?: string;
  timeout?: number;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  circuitBreaker?: boolean;
}

const circuitBreaker = new CircuitBreaker(CircuitBreakerConfig.FAILURE_THRESHOLD, CircuitBreakerConfig.TIMEOUT_MS, CircuitBreakerConfig.RESET_TIMEOUT_MS);

// ====================
// Exponential Backoff Retry
// ====================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const apiError = lastError as ApiError;
      
      if (attempt === maxRetries || !apiError.retryable) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }
  
  throw lastError;
}

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
        if (error.code === ErrorCode.VALIDATION_ERROR) return false;
        if (error.code === ErrorCode.UNAUTHORIZED) return false;
        if (error.code === ErrorCode.FORBIDDEN) return false;
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
      timeoutError.code = ErrorCode.TIMEOUT;
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...initHeaders,
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
      error.code = ErrorCode.INTERNAL_SERVER_ERROR;
      error.requestId = requestIdHeader || requestId;
      throw error;
    }

    return json.data;
  };

  if (useCircuitBreaker) {
    return circuitBreaker.execute(() => 
      fetchWithRetry(executeRequest, RetryCount.THREE, RetryDelay.ONE_SECOND)
    );
  }

  return fetchWithRetry(executeRequest, RetryCount.THREE, RetryDelay.ONE_SECOND);
}

function mapStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 408:
      return ErrorCode.TIMEOUT;
    case 429:
      return ErrorCode.RATE_LIMIT_EXCEEDED;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    case 504:
      return ErrorCode.TIMEOUT;
    default:
      if (status >= 500) return ErrorCode.INTERNAL_SERVER_ERROR;
      return ErrorCode.NETWORK_ERROR;
  }
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
