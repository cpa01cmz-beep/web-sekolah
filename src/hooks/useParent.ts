import { useQuery as useTanstackQuery, UseQueryOptions } from '@tanstack/react-query';
import { parentService } from '@/services/parentService';
import type { ParentDashboardData, ScheduleItem } from '@shared/types';
import { CachingTime } from '@/config/time';

export function useParentDashboard(parentId: string, options?: UseQueryOptions<ParentDashboardData>) {
  return useTanstackQuery({
    queryKey: ['parents', parentId, 'dashboard'],
    queryFn: () => parentService.getDashboard(parentId),
    enabled: !!parentId,
    staleTime: CachingTime.FIVE_MINUTES,
    gcTime: CachingTime.TWENTY_FOUR_HOURS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    ...options,
  });
}

export function useChildSchedule(childId: string, options?: UseQueryOptions<ScheduleItem[]>) {
  return useTanstackQuery({
    queryKey: ['students', childId, 'schedule'],
    queryFn: () => parentService.getChildSchedule(childId),
    enabled: !!childId,
    staleTime: CachingTime.ONE_HOUR,
    gcTime: CachingTime.TWENTY_FOUR_HOURS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    ...options,
  });
}
