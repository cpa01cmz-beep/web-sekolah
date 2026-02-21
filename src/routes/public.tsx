import { lazy } from 'react';
import { withSuspense } from '../router-utils';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
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

export const publicRoutes = [
  {
    path: '/',
    element: withSuspense(HomePage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/about',
    element: withSuspense(AboutPage),
  },
  {
    path: '/contact',
    element: withSuspense(ContactPage),
  },
  {
    path: '/privacy',
    element: withSuspense(PrivacyPolicyPage),
  },
  {
    path: '/news/update',
    element: withSuspense(NewsUpdatePage),
  },
  {
    path: '/news/announcements',
    element: withSuspense(NewsAnnouncementsPage),
  },
  {
    path: '/news/index',
    element: withSuspense(NewsIndexPage),
  },
  {
    path: '/profile/school',
    element: withSuspense(ProfileSchoolPage),
  },
  {
    path: '/profile/services',
    element: withSuspense(ProfileServicesPage),
  },
  {
    path: '/profile/achievements',
    element: withSuspense(ProfileAchievementsPage),
  },
  {
    path: '/profile/extracurricular',
    element: withSuspense(ProfileExtracurricularPage),
  },
  {
    path: '/profile/facilities',
    element: withSuspense(ProfileFacilitiesPage),
  },
  {
    path: '/works',
    element: withSuspense(WorksPage),
  },
  {
    path: '/gallery',
    element: withSuspense(GalleryPage),
  },
  {
    path: '/links/related',
    element: withSuspense(LinksRelatedPage),
  },
  {
    path: '/links/download',
    element: withSuspense(LinksDownloadPage),
  },
  {
    path: '/ppdb',
    element: withSuspense(PPDBPage),
  },
];
