import { useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api-client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from 'react';
import '@/index.css';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const PortalLayout = lazy(() => import('@/pages/portal/PortalLayout'));

// Student Pages
const StudentDashboardPage = lazy(() => import('@/pages/portal/student/StudentDashboardPage'));
const StudentGradesPage = lazy(() => import('@/pages/portal/student/StudentGradesPage'));
const StudentSchedulePage = lazy(() => import('@/pages/portal/student/StudentSchedulePage'));
const StudentCardPage = lazy(() => import('@/pages/portal/student/StudentCardPage'));

// Teacher Pages
const TeacherDashboardPage = lazy(() => import('@/pages/portal/teacher/TeacherDashboardPage'));
const TeacherGradeManagementPage = lazy(() => import('@/pages/portal/teacher/TeacherGradeManagementPage'));
const TeacherAnnouncementsPage = lazy(() => import('@/pages/portal/teacher/TeacherAnnouncementsPage'));

// Parent Pages
const ParentDashboardPage = lazy(() => import('@/pages/portal/parent/ParentDashboardPage'));
const ParentStudentSchedulePage = lazy(() => import('@/pages/portal/parent/ParentStudentSchedulePage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('@/pages/portal/admin/AdminDashboardPage'));
const AdminUserManagementPage = lazy(() => import('@/pages/portal/admin/AdminUserManagementPage'));
const AdminAnnouncementsPage = lazy(() => import('@/pages/portal/admin/AdminAnnouncementsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/portal/admin/AdminSettingsPage'));

// New Pages for Issue #11
const NewsUpdatePage = lazy(() => import('@/pages/NewsUpdatePage'));
const NewsAnnouncementsPage = lazy(() => import('@/pages/NewsAnnouncementsPage'));
const NewsIndexPage = lazy(() => import('@/pages/NewsIndexPage'));
const ProfileSchoolPage = lazy(() => import('@/pages/ProfileSchoolPage'));
const ProfileServicesPage = lazy(() => import('@/pages/ProfileServicesPage'));
const ProfileAchievementsPage = lazy(() => import('@/pages/ProfileAchievementsPage'));
const ProfileExtracurricularPage = lazy(() => import('@/pages/ProfileExtracurricularPage'));
const ProfileFacilitiesPage = lazy(() => import('@/pages/ProfileFacilitiesPage'));
const WorksPage = lazy(() => import('@/pages/WorksPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const LinksRelatedPage = lazy(() => import('@/pages/LinksRelatedPage'));
const LinksDownloadPage = lazy(() => import('@/pages/LinksDownloadPage'));
const PPDBPage = lazy(() => import('@/pages/PPDBPage'));

// Fallback component for loading states
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Suspense fallback={<LoadingFallback />}><HomePage /></Suspense>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>,
  },
  {
    path: "/portal",
    element: <Suspense fallback={<LoadingFallback />}><PortalLayout /></Suspense>,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense> },
      {
        path: "student",
        children: [
          { index: true, element: <Suspense fallback={<LoadingFallback />}><StudentDashboardPage /></Suspense> },
          { path: "dashboard", element: <Suspense fallback={<LoadingFallback />}><StudentDashboardPage /></Suspense> },
          { path: "grades", element: <Suspense fallback={<LoadingFallback />}><StudentGradesPage /></Suspense> },
          { path: "schedule", element: <Suspense fallback={<LoadingFallback />}><StudentSchedulePage /></Suspense> },
          { path: "card", element: <Suspense fallback={<LoadingFallback />}><StudentCardPage /></Suspense> },
        ],
      },
      {
        path: "teacher",
        children: [
          { index: true, element: <Suspense fallback={<LoadingFallback />}><TeacherDashboardPage /></Suspense> },
          { path: "dashboard", element: <Suspense fallback={<LoadingFallback />}><TeacherDashboardPage /></Suspense> },
          { path: "grades", element: <Suspense fallback={<LoadingFallback />}><TeacherGradeManagementPage /></Suspense> },
          { path: "announcements", element: <Suspense fallback={<LoadingFallback />}><TeacherAnnouncementsPage /></Suspense> },
        ],
      },
      {
        path: "parent",
        children: [
          { index: true, element: <Suspense fallback={<LoadingFallback />}><ParentDashboardPage /></Suspense> },
          { path: "dashboard", element: <Suspense fallback={<LoadingFallback />}><ParentDashboardPage /></Suspense> },
          { path: "schedule", element: <Suspense fallback={<LoadingFallback />}><ParentStudentSchedulePage /></Suspense> },
        ],
      },
      {
        path: "admin",
        children: [
          { index: true, element: <Suspense fallback={<LoadingFallback />}><AdminDashboardPage /></Suspense> },
          { path: "dashboard", element: <Suspense fallback={<LoadingFallback />}><AdminDashboardPage /></Suspense> },
          { path: "users", element: <Suspense fallback={<LoadingFallback />}><AdminUserManagementPage /></Suspense> },
          { path: "announcements", element: <Suspense fallback={<LoadingFallback />}><AdminAnnouncementsPage /></Suspense> },
          { path: "settings", element: <Suspense fallback={<LoadingFallback />}><AdminSettingsPage /></Suspense> },
        ],
      },
    ],
  },
  { path: "/about", element: <Suspense fallback={<LoadingFallback />}><AboutPage /></Suspense> },
  { path: "/contact", element: <Suspense fallback={<LoadingFallback />}><ContactPage /></Suspense> },
  { path: "/privacy", element: <Suspense fallback={<LoadingFallback />}><PrivacyPolicyPage /></Suspense> },
  // New routes for Issue #11
  { path: "/news/update", element: <Suspense fallback={<LoadingFallback />}><NewsUpdatePage /></Suspense> },
  { path: "/news/announcements", element: <Suspense fallback={<LoadingFallback />}><NewsAnnouncementsPage /></Suspense> },
  { path: "/news/index", element: <Suspense fallback={<LoadingFallback />}><NewsIndexPage /></Suspense> },
  { path: "/profile/school", element: <Suspense fallback={<LoadingFallback />}><ProfileSchoolPage /></Suspense> },
  { path: "/profile/services", element: <Suspense fallback={<LoadingFallback />}><ProfileServicesPage /></Suspense> },
  { path: "/profile/achievements", element: <Suspense fallback={<LoadingFallback />}><ProfileAchievementsPage /></Suspense> },
  { path: "/profile/extracurricular", element: <Suspense fallback={<LoadingFallback />}><ProfileExtracurricularPage /></Suspense> },
  { path: "/profile/facilities", element: <Suspense fallback={<LoadingFallback />}><ProfileFacilitiesPage /></Suspense> },
  { path: "/works", element: <Suspense fallback={<LoadingFallback />}><WorksPage /></Suspense> },
  { path: "/gallery", element: <Suspense fallback={<LoadingFallback />}><GalleryPage /></Suspense> },
  { path: "/links/related", element: <Suspense fallback={<LoadingFallback />}><LinksRelatedPage /></Suspense> },
  { path: "/links/download", element: <Suspense fallback={<LoadingFallback />}><LinksDownloadPage /></Suspense> },
  { path: "/ppdb", element: <Suspense fallback={<LoadingFallback />}><PPDBPage /></Suspense> },
]);

export function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} fallbackElement={<LoadingFallback />} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}