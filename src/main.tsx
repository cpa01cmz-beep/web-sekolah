import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
// Import Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { PortalLayout } from '@/pages/portal/PortalLayout';
// Student Pages
import { StudentDashboardPage } from '@/pages/portal/student/StudentDashboardPage';
import { StudentGradesPage } from '@/pages/portal/student/StudentGradesPage';
import { StudentSchedulePage } from '@/pages/portal/student/StudentSchedulePage';
import { StudentCardPage } from '@/pages/portal/student/StudentCardPage';
// Teacher Pages
import { TeacherDashboardPage } from '@/pages/portal/teacher/TeacherDashboardPage';
import { TeacherGradeManagementPage } from '@/pages/portal/teacher/TeacherGradeManagementPage';
import { TeacherAnnouncementsPage } from '@/pages/portal/teacher/TeacherAnnouncementsPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/portal",
    element: <PortalLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> }, // Default redirect if no role
      {
        path: "student",
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <StudentDashboardPage /> },
          { path: "grades", element: <StudentGradesPage /> },
          { path: "schedule", element: <StudentSchedulePage /> },
          { path: "card", element: <StudentCardPage /> },
        ],
      },
      {
        path: "teacher",
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <TeacherDashboardPage /> },
          { path: "grades", element: <TeacherGradeManagementPage /> },
          { path: "announcements", element: <TeacherAnnouncementsPage /> },
        ],
      },
      // Future routes for other roles (parent, admin)
    ],
  },
  // Placeholder routes for links in header/footer
  { path: "/about", element: <div>About Page</div> },
  { path: "/contact", element: <div>Contact Page</div> },
  { path: "/privacy", element: <div>Privacy Policy Page</div> },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);