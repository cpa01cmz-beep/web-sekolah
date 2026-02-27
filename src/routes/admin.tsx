import { lazy } from 'react'
import { withSuspense } from '../router-utils'

const AdminDashboardPage = lazy(() => import('@/pages/portal/admin/AdminDashboardPage'))
const AdminUserManagementPage = lazy(() => import('@/pages/portal/admin/AdminUserManagementPage'))
const AdminAnnouncementsPage = lazy(() => import('@/pages/portal/admin/AdminAnnouncementsPage'))
const AdminSettingsPage = lazy(() => import('@/pages/portal/admin/AdminSettingsPage'))

export const adminRoutes = {
  path: 'admin',
  children: [
    { index: true, element: withSuspense(AdminDashboardPage) },
    { path: 'dashboard', element: withSuspense(AdminDashboardPage) },
    { path: 'users', element: withSuspense(AdminUserManagementPage) },
    { path: 'announcements', element: withSuspense(AdminAnnouncementsPage) },
    { path: 'settings', element: withSuspense(AdminSettingsPage) },
  ],
}
