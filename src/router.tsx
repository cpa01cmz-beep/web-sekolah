import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { withSuspense } from './router-utils';
import { publicRoutes } from './routes/public';
import { studentRoutes } from './routes/student';
import { teacherRoutes } from './routes/teacher';
import { parentRoutes } from './routes/parent';
import { adminRoutes } from './routes/admin';

const PortalLayout = lazy(() => import('@/pages/portal/PortalLayout'));

export const router = createBrowserRouter([
  ...publicRoutes,
  {
    path: '/portal',
    element: withSuspense(PortalLayout),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: withSuspense(lazy(() => import('@/pages/LoginPage'))) },
      studentRoutes,
      teacherRoutes,
      parentRoutes,
      adminRoutes,
    ],
  },
]);
