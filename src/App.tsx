import { useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkipLink } from '@/components/SkipLink';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api-client';
import { RouterProvider } from "react-router-dom";
import '@/index.css';
import { router } from './router';
import { LoadingFallback } from './router-utils';

export function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      <SkipLink targetId="main-content" />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} fallbackElement={<LoadingFallback />} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}