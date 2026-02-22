export { useIsMobile } from './use-mobile';
export { useReducedMotion } from './use-reduced-motion';
export { useTheme } from './use-theme';
export { useScheduleGrouping } from './useScheduleGrouping';
export { useFormValidation } from './useFormValidation';
export type { Validator, FormValidationConfig, FormValidationResult } from './useFormValidation';
export { useRecharts } from './useRecharts';
export type { RechartsComponent, UseRechartsOptions, UseRechartsResult } from './useRecharts';
export {
  useAdminDashboard,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useSettings,
  useUpdateSettings,
} from './useAdmin';
export {
  useStudentDashboard,
  useStudentGrades,
  useStudentSchedule,
  useStudentCard,
} from './useStudent';
export {
  useTeacherDashboard,
  useTeacherClasses,
  useTeacherSchedule,
  useSubmitGrade,
  useTeacherAnnouncements,
  useCreateAnnouncement as useCreateTeacherAnnouncement,
  useTeacherClassStudents,
} from './useTeacher';
export {
  useParentDashboard,
  useChildSchedule,
} from './useParent';
