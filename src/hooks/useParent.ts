import { useQuery as useTanstackQuery, UseQueryOptions } from '@tanstack/react-query';
import { parentService } from '@/services/parentService';
import type { ParentDashboardData, ScheduleItem } from '@shared/types';
import { CachingTime } from '@/config/time';
import { createQueryOptions } from '@/config/query-config';

export function useParentDashboard(parentId: string, options?: UseQueryOptions<ParentDashboardData>) {
  return useTanstackQuery({
    queryKey: ['parents', parentId, 'dashboard'],
    queryFn: () => parentService.getDashboard(parentId),
    ...createQueryOptions<ParentDashboardData>({ enabled: !!parentId, staleTime: CachingTime.FIVE_MINUTES }),
    ...options,
  });
}

export function useChildSchedule(childId: string, options?: UseQueryOptions<ScheduleItem[]>) {
  return useTanstackQuery({
    queryKey: ['students', childId, 'schedule'],
    queryFn: () => parentService.getChildSchedule(childId),
    ...createQueryOptions<ScheduleItem[]>({ enabled: !!childId, staleTime: CachingTime.ONE_HOUR }),
    ...options,
  });
}
