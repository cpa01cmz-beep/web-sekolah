import { memo } from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardEmptyStateProps {
  message: string;
  className?: string;
}

export const DashboardCardEmptyState = memo(function DashboardCardEmptyState({
  message,
  className,
}: DashboardCardEmptyStateProps) {
  return (
    <p
      className={cn('text-sm text-muted-foreground text-center py-4', className)}
      role="status"
    >
      {message}
    </p>
  );
});
DashboardCardEmptyState.displayName = 'DashboardCardEmptyState';
