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

// Helper function to wrap components with Suspense and LoadingFallback
function withSuspense<T extends React.ComponentType<any>>(Component: T) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(HomePage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: withSuspense(LoginPage),
  },
  {
    path: "/portal",
    element: withSuspense(PortalLayout),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: withSuspense(LoginPage) },
      {
        path: "student",
        children: [
          { index: true, element: withSuspense(StudentDashboardPage) },
          { path: "dashboard", element: withSuspense(StudentDashboardPage) },
          { path: "grades", element: withSuspense(StudentGradesPage) },
          { path: "schedule", element: withSuspense(StudentSchedulePage) },
          { path: "card", element: withSuspense(StudentCardPage) },
        ],
      },
      {
        path: "teacher",
        children: [
          { index: true, element: withSuspense(TeacherDashboardPage) },
          { path: "dashboard", element: withSuspense(TeacherDashboardPage) },
          { path: "grades", element: withSuspense(TeacherGradeManagementPage) },
          { path: "announcements", element: withSuspense(TeacherAnnouncementsPage) },
        ],
      },
      {
        path: "parent",
        children: [
          { index: true, element: withSuspense(ParentDashboardPage) },
          { path: "dashboard", element: withSuspense(ParentDashboardPage) },
          { path: "schedule", element: withSuspense(ParentStudentSchedulePage) },
        ],
      },
      {
        path: "admin",
        children: [
          { index: true, element: withSuspense(AdminDashboardPage) },
          { path: "dashboard", element: withSuspense(AdminDashboardPage) },
          { path: "users", element: withSuspense(AdminUserManagementPage) },
          { path: "announcements", element: withSuspense(AdminAnnouncementsPage) },
          { path: "settings", element: withSuspense(AdminSettingsPage) },
        ],
      },
    ],
  },
  { path: "/about", element: withSuspense(AboutPage) },
  { path: "/contact", element: withSuspense(ContactPage) },
  { path: "/privacy", element: withSuspense(PrivacyPolicyPage) },
  // New routes for Issue #11
  { path: "/news/update", element: withSuspense(NewsUpdatePage) },
  { path: "/news/announcements", element: withSuspense(NewsAnnouncementsPage) },
  { path: "/news/index", element: withSuspense(NewsIndexPage) },
  { path: "/profile/school", element: withSuspense(ProfileSchoolPage) },
  { path: "/profile/services", element: withSuspense(ProfileServicesPage) },
  { path: "/profile/achievements", element: withSuspense(ProfileAchievementsPage) },
  { path: "/profile/extracurricular", element: withSuspense(ProfileExtracurricularPage) },
  { path: "/profile/facilities", element: withSuspense(ProfileFacilitiesPage) },
  { path: "/works", element: withSuspense(WorksPage) },
  { path: "/gallery", element: withSuspense(GalleryPage) },
  { path: "/links/related", element: withSuspense(LinksRelatedPage) },
  { path: "/links/download", element: withSuspense(LinksDownloadPage) },
  { path: "/ppdb", element: withSuspense(PPDBPage) },
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