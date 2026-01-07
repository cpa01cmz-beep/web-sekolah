import { useQuery as useTanstackQuery, useMutation as useTanstackMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import type { StudentDashboardData, Grade, ScheduleItem, StudentCardData, SubmitGradeData, CreateAnnouncementData } from '@shared/types';

export function useStudentDashboard(studentId: string, options?: UseQueryOptions<StudentDashboardData>) {
  return useTanstackQuery({
    queryKey: ['students', studentId, 'dashboard'],
    queryFn: () => studentService.getDashboard(studentId),
    enabled: !!studentId,
    ...options,
  });
}

export function useStudentGrades(studentId: string, options?: UseQueryOptions<Grade[]>) {
  return useTanstackQuery({
    queryKey: ['students', studentId, 'grades'],
    queryFn: () => studentService.getGrades(studentId),
    enabled: !!studentId,
    ...options,
  });
}

export function useStudentSchedule(studentId: string, options?: UseQueryOptions<ScheduleItem[]>) {
  return useTanstackQuery({
    queryKey: ['students', studentId, 'schedule'],
    queryFn: () => studentService.getSchedule(studentId),
    enabled: !!studentId,
    ...options,
  });
}

export function useStudentCard(studentId: string, options?: UseQueryOptions<StudentCardData>) {
  return useTanstackQuery({
    queryKey: ['students', studentId, 'card'],
    queryFn: () => studentService.getCard(studentId),
    enabled: !!studentId,
    ...options,
  });
}
