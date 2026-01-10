import { lazy } from 'react';
import { withSuspense } from '../router-utils';

const TeacherDashboardPage = lazy(() => import('@/pages/portal/teacher/TeacherDashboardPage'));
const TeacherGradeManagementPage = lazy(() => import('@/pages/portal/teacher/TeacherGradeManagementPage'));
const TeacherAnnouncementsPage = lazy(() => import('@/pages/portal/teacher/TeacherAnnouncementsPage'));

export const teacherRoutes = {
  path: "teacher",
  children: [
    { index: true, element: withSuspense(TeacherDashboardPage) },
    { path: "dashboard", element: withSuspense(TeacherDashboardPage) },
    { path: "grades", element: withSuspense(TeacherGradeManagementPage) },
    { path: "announcements", element: withSuspense(TeacherAnnouncementsPage) },
  ],
};
