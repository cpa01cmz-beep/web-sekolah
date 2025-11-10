import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api-client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
// Import Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
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
// Parent Pages
import { ParentDashboardPage } from '@/pages/portal/parent/ParentDashboardPage';
import { ParentStudentSchedulePage } from '@/pages/portal/parent/ParentStudentSchedulePage';
// Admin Pages
import { AdminDashboardPage } from '@/pages/portal/admin/AdminDashboardPage';
import { AdminUserManagementPage } from '@/pages/portal/admin/AdminUserManagementPage';
import { AdminAnnouncementsPage } from '@/pages/portal/admin/AdminAnnouncementsPage';
import { AdminSettingsPage } from '@/pages/portal/admin/AdminSettingsPage';
// New Pages for Issue #11
import { NewsUpdatePage } from '@/pages/NewsUpdatePage';
import { NewsAnnouncementsPage } from '@/pages/NewsAnnouncementsPage';
import { NewsIndexPage } from '@/pages/NewsIndexPage';
import { ProfileSchoolPage } from '@/pages/ProfileSchoolPage';
import { ProfileServicesPage } from '@/pages/ProfileServicesPage';
import { ProfileAchievementsPage } from '@/pages/ProfileAchievementsPage';
import { ProfileExtracurricularPage } from '@/pages/ProfileExtracurricularPage';
import { ProfileFacilitiesPage } from '@/pages/ProfileFacilitiesPage';
import { WorksPage } from '@/pages/WorksPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { LinksRelatedPage } from '@/pages/LinksRelatedPage';
import { LinksDownloadPage } from '@/pages/LinksDownloadPage';
import { PPDBPage } from '@/pages/PPDBPage';
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
      { index: true, element: <Navigate to="/login" replace /> },
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
      {
        path: "parent",
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <ParentDashboardPage /> },
          { path: "schedule", element: <ParentStudentSchedulePage /> },
        ],
      },
      {
        path: "admin",
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "users", element: <AdminUserManagementPage /> },
          { path: "announcements", element: <AdminAnnouncementsPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
        ],
      },
    ],
  },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/privacy", element: <PrivacyPolicyPage /> },
  // New routes for Issue #11
  { path: "/news/update", element: <NewsUpdatePage /> },
  { path: "/news/announcements", element: <NewsAnnouncementsPage /> },
  { path: "/news/index", element: <NewsIndexPage /> },
  { path: "/profile/school", element: <ProfileSchoolPage /> },
  { path: "/profile/services", element: <ProfileServicesPage /> },
  { path: "/profile/achievements", element: <ProfileAchievementsPage /> },
  { path: "/profile/extracurricular", element: <ProfileExtracurricularPage /> },
  { path: "/profile/facilities", element: <ProfileFacilitiesPage /> },
  { path: "/works", element: <WorksPage /> },
  { path: "/gallery", element: <GalleryPage /> },
  { path: "/links/related", element: <LinksRelatedPage /> },
  { path: "/links/download", element: <LinksDownloadPage /> },
  { path: "/ppdb", element: <PPDBPage /> },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);