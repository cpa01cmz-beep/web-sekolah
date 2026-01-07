import { useQuery as useTanstackQuery, useMutation as useTanstackMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import type { StudentDashboardData, Grade, ScheduleItem, StudentCardData, SubmitGradeData, CreateAnnouncementData } from '@shared/types';
import { CachingTime } from '@/config/time';

export function useStudentDashboard(studentId: string, options?: UseQueryOptions<StudentDashboardData>) {
  return useTanstackQuery({
    queryKey: ['students', studentId, 'dashboard'],
    queryFn: () => studentService.getDashboard(studentId),
    enabled: !!studentId,
    staleTime: CachingTime.FIVE_MINUTES,
    gcTime: CachingTime.TWENTY_FOUR_HOURS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    ...options,
  });
}

export function useStudentGrades(studentId: string, options?: UseQueryOptions<Grade[]>) {
  return useTanstackQuery({
    queryKey: ['students', studentId, 'grades'],
    queryFn: () => studentService.getGrades(studentId),
    enabled: !!studentId,
    staleTime: CachingTime.THIRTY_MINUTES,
    gcTime: CachingTime.TWENTY_FOUR_HOURS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    ...options,
  });
}

export function useStudentSchedule(studentId: string, options?: UseQueryOptions<ScheduleItem[]>) {
  return useTanstackQuery({
    queryKey: ['students', studentId, 'schedule'],
    queryFn: () => studentService.getSchedule(studentId),
    enabled: !!studentId,
    staleTime: CachingTime.ONE_HOUR,
    gcTime: CachingTime.TWENTY_FOUR_HOURS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    ...options,
  });
}

export function useStudentCard(studentId: string, options?: UseQueryOptions<StudentCardData>) {
  return useTanstackQuery({
    queryKey: ['students', studentId, 'card'],
    queryFn: () => studentService.getCard(studentId),
    enabled: !!studentId,
    staleTime: CachingTime.TWENTY_FOUR_HOURS,
    gcTime: CachingTime.SEVEN_DAYS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    ...options,
  });
}
