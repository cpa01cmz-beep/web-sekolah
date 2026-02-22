import { useQuery as useTanstackQuery, UseQueryOptions } from '@tanstack/react-query';
import { createQueryOptions } from './query-config';

export type QueryConfig<T> = Partial<Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>> & {
  enabled?: boolean;
};

export interface CreateQueryHookOptions<T, P extends unknown[]> {
  queryKey: (params: P) => unknown[];
  queryFn: (params: P) => Promise<T>;
  defaultOptions?: QueryConfig<T>;
}

export function createQueryHook<T, P extends unknown[] = []>(
  options: CreateQueryHookOptions<T, P>
): (params: P, queryOptions?: QueryConfig<T>) => ReturnType<typeof useTanstackQuery<T>> {
  const { queryKey, queryFn, defaultOptions = {} } = options;
  const defaultQueryOptions = createQueryOptions<T>(defaultOptions);

  return (params: P, queryOptions?: QueryConfig<T>) => {
    const mergedOptions = queryOptions 
      ? { ...defaultQueryOptions, ...createQueryOptions<T>(queryOptions) }
      : defaultQueryOptions;

    return useTanstackQuery<T>({
      queryKey: queryKey(params),
      queryFn: () => queryFn(params),
      ...mergedOptions,
    });
  };
}

export function createEntityQueryKey<T extends string>(
  entity: T
): (id: string, subResource?: string) => [T, string, string?] {
  return (id: string, subResource?: string) => 
    subResource ? [entity, id, subResource] : [entity, id];
}

export function createSimpleQueryKey<T extends string>(
  entity: T
): () => [T] {
  return () => [entity];
}
