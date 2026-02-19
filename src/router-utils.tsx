/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react';
import { cn } from '@/lib/utils';

export const LoadingFallback = () => (
  <div 
    className="flex items-center justify-center h-screen" 
    role="status" 
    aria-live="polite"
    aria-label="Loading page content"
  >
    <div 
      className={cn(
        "rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500",
        "motion-reduce:animate-[none]"
      )} 
      aria-hidden="true"
    />
    <span className="sr-only">Loading...</span>
  </div>
);

export function withSuspense<T extends React.ComponentType<any>>(Component: T): React.ComponentType {
  return function SuspenseWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
