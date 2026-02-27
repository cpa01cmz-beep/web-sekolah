import {
  useQuery as useTanstackQuery,
  useMutation as useTanstackMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import { teacherService } from '@/services/teacherService'
import type {
  TeacherDashboardData,
  SchoolClass,
  Grade,
  SubmitGradeData,
  Announcement,
  CreateAnnouncementData,
  ClassStudentWithGrade,
  ScheduleItem,
} from '@shared/types'
import { CachingTime } from '@/config/time'
import { createQueryOptions } from '@/config/query-config'
import { createEntityQueryKey, createSimpleQueryKey } from '@/config/query-factory'

const teacherKey = createEntityQueryKey('teachers')
const classKey = createEntityQueryKey('classes')

export function useTeacherDashboard(
  teacherId: string,
  options?: UseQueryOptions<TeacherDashboardData>
) {
  return useTanstackQuery({
    queryKey: teacherKey(teacherId, 'dashboard'),
    queryFn: () => teacherService.getDashboard(teacherId),
    ...createQueryOptions<TeacherDashboardData>({
      enabled: !!teacherId,
      staleTime: CachingTime.FIVE_MINUTES,
    }),
    ...options,
  })
}

export function useTeacherClasses(teacherId: string, options?: UseQueryOptions<SchoolClass[]>) {
  return useTanstackQuery({
    queryKey: teacherKey(teacherId, 'classes'),
    queryFn: () => teacherService.getClasses(teacherId),
    ...createQueryOptions<SchoolClass[]>({ enabled: !!teacherId, staleTime: CachingTime.ONE_HOUR }),
    ...options,
  })
}

export function useTeacherSchedule(
  teacherId: string,
  options?: UseQueryOptions<(ScheduleItem & { className: string; courseName: string })[]>
) {
  return useTanstackQuery({
    queryKey: teacherKey(teacherId, 'schedule'),
    queryFn: () => teacherService.getSchedule(teacherId),
    ...createQueryOptions<(ScheduleItem & { className: string; courseName: string })[]>({
      enabled: !!teacherId,
      staleTime: CachingTime.ONE_HOUR,
    }),
    ...options,
  })
}

export function useSubmitGrade(options?: UseMutationOptions<Grade, Error, SubmitGradeData>) {
  return useTanstackMutation({
    mutationFn: (gradeData: SubmitGradeData) => teacherService.submitGrade(gradeData),
    ...options,
  })
}

export function useTeacherAnnouncements(
  teacherId: string,
  options?: UseQueryOptions<Announcement[]>
) {
  return useTanstackQuery({
    queryKey: teacherKey(teacherId, 'announcements'),
    queryFn: () => teacherService.getAnnouncements(teacherId),
    ...createQueryOptions<Announcement[]>({
      enabled: !!teacherId,
      staleTime: CachingTime.FIVE_MINUTES,
    }),
    ...options,
  })
}

export function useCreateAnnouncement(
  options?: UseMutationOptions<Announcement, Error, CreateAnnouncementData>
) {
  return useTanstackMutation({
    mutationFn: (announcement: CreateAnnouncementData) =>
      teacherService.createAnnouncement(announcement),
    ...options,
  })
}

export function useTeacherClassStudents(
  classId: string,
  options?: UseQueryOptions<ClassStudentWithGrade[]>
) {
  return useTanstackQuery({
    queryKey: classKey(classId, 'students'),
    queryFn: () => teacherService.getClassStudentsWithGrades(classId),
    ...createQueryOptions<ClassStudentWithGrade[]>({
      enabled: !!classId,
      staleTime: CachingTime.FIVE_MINUTES,
    }),
    ...options,
  })
}
