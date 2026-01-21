import { useQuery as useTanstackQuery, useMutation as useTanstackMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { ApiTimeout } from '../../config/time';
import type { ApiError } from './query-client';

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
