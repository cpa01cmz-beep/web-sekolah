import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { AlertTriangle, Inbox } from 'lucide-react';

interface DashboardLayoutProps<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | undefined;
  children: React.ReactNode | ((data: T) => React.ReactNode);
}

export function DashboardLayout<T>({ isLoading, error, data, children }: DashboardLayoutProps<T>) {
  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load dashboard data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={Inbox}
        title="No data available"
        description="We couldn't find any data for your dashboard. Please try again later or contact support if issue persists."
        variant="error"
      />
    );
  }

  if (typeof children === 'function') {
    return <>{children(data)}</>;
  }

  return <>{children}</>;
}
