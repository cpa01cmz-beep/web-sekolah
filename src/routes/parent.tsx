import { lazy } from 'react';
import { withSuspense } from '../router-utils';

const ParentDashboardPage = lazy(() => import('@/pages/portal/parent/ParentDashboardPage'));
const ParentStudentSchedulePage = lazy(() => import('@/pages/portal/parent/ParentStudentSchedulePage'));

export const parentRoutes = {
  path: "parent",
  children: [
    { index: true, element: withSuspense(ParentDashboardPage) },
    { path: "dashboard", element: withSuspense(ParentDashboardPage) },
    { path: "schedule", element: withSuspense(ParentStudentSchedulePage) },
  ],
};
