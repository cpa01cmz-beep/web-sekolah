import { QueryClient, useQuery as useTanstackQuery, useMutation as useTanstackMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiResponse } from "../../shared/types";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error.status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});
async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const error = new Error(errorJson.error || `Request failed with status ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || json.data === undefined) {
    throw new Error(json.error || 'API request failed');
  }
  return json.data;
}
// --- Custom Hooks ---
type QueryKey = readonly unknown[];
export function useQuery<TData, TError = Error>(
  queryKey: QueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  const queryFn = () => apiClient<TData>(`/api/${queryKey.join('/')}`);
  return useTanstackQuery<TData, TError>({
    queryKey,
    queryFn,
    ...options,
  });
}
export function useMutation<TData, TError = Error, TVariables = void>(
  mutationKey: QueryKey,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationKey' | 'mutationFn'>
) {
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