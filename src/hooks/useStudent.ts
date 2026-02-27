import { useQuery as useTanstackQuery, UseQueryOptions } from '@tanstack/react-query'
import { studentService } from '@/services/studentService'
import type { StudentDashboardData, Grade, ScheduleItem, StudentCardData } from '@shared/types'
import { CachingTime } from '@/config/time'
import { createQueryOptions } from '@/config/query-config'
import { createEntityQueryKey } from '@/config/query-factory'

const studentKey = createEntityQueryKey('students')

export function useStudentDashboard(
  studentId: string,
  options?: UseQueryOptions<StudentDashboardData>
) {
  return useTanstackQuery({
    queryKey: studentKey(studentId, 'dashboard'),
    queryFn: () => studentService.getDashboard(studentId),
    ...createQueryOptions<StudentDashboardData>({
      enabled: !!studentId,
      staleTime: CachingTime.FIVE_MINUTES,
    }),
    ...options,
  })
}

export function useStudentGrades(studentId: string, options?: UseQueryOptions<Grade[]>) {
  return useTanstackQuery({
    queryKey: studentKey(studentId, 'grades'),
    queryFn: () => studentService.getGrades(studentId),
    ...createQueryOptions<Grade[]>({ enabled: !!studentId, staleTime: CachingTime.THIRTY_MINUTES }),
    ...options,
  })
}

export function useStudentSchedule(studentId: string, options?: UseQueryOptions<ScheduleItem[]>) {
  return useTanstackQuery({
    queryKey: studentKey(studentId, 'schedule'),
    queryFn: () => studentService.getSchedule(studentId),
    ...createQueryOptions<ScheduleItem[]>({
      enabled: !!studentId,
      staleTime: CachingTime.ONE_HOUR,
    }),
    ...options,
  })
}

export function useStudentCard(studentId: string, options?: UseQueryOptions<StudentCardData>) {
  return useTanstackQuery({
    queryKey: studentKey(studentId, 'card'),
    queryFn: () => studentService.getCard(studentId),
    ...createQueryOptions<StudentCardData>({
      enabled: !!studentId,
      staleTime: CachingTime.TWENTY_FOUR_HOURS,
      gcTime: CachingTime.SEVEN_DAYS,
      refetchOnReconnect: false,
    }),
    ...options,
  })
}
