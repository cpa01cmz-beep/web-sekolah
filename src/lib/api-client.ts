// ====================
// API Client with React Query Integration
// ====================

import { QueryClient, useQuery as useTanstackQuery, useMutation as useTanstackMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiResponse } from "../../shared/types";

// ====================
// Type Definitions
// ====================

interface ApiError extends Error {
  status?: number;
}

interface MutationOptions<TData, TError, TVariables> extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationKey' | 'mutationFn'> {
  method?: string;
}

// ====================
// Query Client Configuration
// ====================

/**
 * Centralized QueryClient instance with default configuration
 * Configures stale time and retry behavior for all queries
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: ApiError) => {
        // Don't retry on 404 errors
        if (error.status === 404) return false;
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
    },
  },
});

// ====================
// Core API Client Function
// ====================

/**
 * Generic API client function that handles requests and responses
 * @template T - The expected response data type
 * @param path - The API endpoint path
 * @param init - Request initialization options
 * @returns The response data
 * @throws Error if the request fails or returns an unsuccessful response
 */
export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  
  // Handle HTTP errors
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const error = new Error(errorJson.error || `Request failed with status ${res.status}`) as ApiError;
    error.status = res.status;
    throw error;
  }
  
  // Parse and validate API response
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || json.data === undefined) {
    throw new Error(json.error || 'API request failed');
  }
  
  return json.data;
}

// ====================
// Custom React Query Hooks
// ====================

type QueryKey = readonly unknown[];

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
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  // Construct API path from query key
  const queryFn = () => apiClient<TData>(`/api/${queryKey.join('/')}`);
  
  return useTanstackQuery<TData, TError>({
    queryKey,
    queryFn,
    ...options,
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
  options?: MutationOptions<TData, TError, TVariables>
) {
  // Construct mutation function with proper HTTP method handling
  const mutationFn = async (variables: TVariables) => {
    const path = `/api/${mutationKey.join('/')}`;
    const method = options?.method as string || 'POST';
    const body = method !== 'GET' && method !== 'DELETE' ? JSON.stringify(variables) : undefined;
    return apiClient<TData>(path, { method, body });
  };
  
  return useTanstackMutation<TData, TError, TVariables>({
    mutationKey,
    mutationFn,
    ...options,
  });
}