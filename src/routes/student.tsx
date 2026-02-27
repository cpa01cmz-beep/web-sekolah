import { lazy } from 'react'
import { withSuspense } from '../router-utils'

const StudentDashboardPage = lazy(() => import('@/pages/portal/student/StudentDashboardPage'))
const StudentGradesPage = lazy(() => import('@/pages/portal/student/StudentGradesPage'))
const StudentSchedulePage = lazy(() => import('@/pages/portal/student/StudentSchedulePage'))
const StudentCardPage = lazy(() => import('@/pages/portal/student/StudentCardPage'))

export const studentRoutes = {
  path: 'student',
  children: [
    { index: true, element: withSuspense(StudentDashboardPage) },
    { path: 'dashboard', element: withSuspense(StudentDashboardPage) },
    { path: 'grades', element: withSuspense(StudentGradesPage) },
    { path: 'schedule', element: withSuspense(StudentSchedulePage) },
    { path: 'card', element: withSuspense(StudentCardPage) },
  ],
}
