import type { UseQueryOptions } from '@tanstack/react-query'
import { CachingTime } from './time'

export type { QueryConfig } from './query-factory'

type InternalQueryConfig<T> = Partial<Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>> & {
  enabled?: boolean
}

export function createQueryOptions<T>(
  config: InternalQueryConfig<T> = {}
): Partial<UseQueryOptions<T>> {
  const {
    enabled = true,
    staleTime = CachingTime.FIVE_MINUTES,
    gcTime = CachingTime.TWENTY_FOUR_HOURS,
    refetchOnWindowFocus = false,
    refetchOnMount = false,
    refetchOnReconnect = true,
    ...rest
  } = config

  return {
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    ...rest,
  }
}
