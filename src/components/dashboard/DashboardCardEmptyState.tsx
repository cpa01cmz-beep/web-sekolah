import { memo } from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardEmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export const DashboardCardEmptyState = memo(function DashboardCardEmptyState({
  message,
  icon,
  className,
}: DashboardCardEmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-4', className)}
      role="status"
    >
      {icon && (
        <div className="mb-2 text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-sm text-muted-foreground text-center">{message}</p>
    </div>
  );
});
DashboardCardEmptyState.displayName = 'DashboardCardEmptyState';
