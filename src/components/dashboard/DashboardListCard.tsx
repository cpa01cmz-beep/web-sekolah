import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCardEmptyState } from './DashboardCardEmptyState';
import { cn } from '@/lib/utils';

interface DashboardListCardProps<T> {
  title: string;
  icon: React.ReactNode;
  items: T[];
  emptyMessage: string;
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  listClassName?: string;
  titleId?: string;
  itemAriaLabel?: (count: number) => string;
}

function DashboardListCardInner<T>({
  title,
  icon,
  items,
  emptyMessage,
  renderItem,
  getKey,
  className,
  headerClassName,
  contentClassName,
  listClassName,
  titleId,
  itemAriaLabel,
}: DashboardListCardProps<T>) {
  const resolvedTitleId = titleId || `${title.toLowerCase().replace(/\s+/g, '-')}-heading`;

  return (
    <Card className={cn('h-full hover:shadow-lg transition-shadow duration-200', className)}>
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 pb-2', headerClassName)}>
        <CardTitle id={resolvedTitleId} className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className={contentClassName}>
        {items.length === 0 ? (
          <DashboardCardEmptyState message={emptyMessage} />
        ) : (
          <ul
            className={cn('space-y-3', listClassName)}
            aria-labelledby={resolvedTitleId}
            aria-label={itemAriaLabel ? itemAriaLabel(items.length) : `${items.length} items`}
          >
            {items.map((item) => (
              <li key={getKey(item)}>{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export const DashboardListCard = memo(DashboardListCardInner) as typeof DashboardListCardInner;
DashboardListCard.displayName = 'DashboardListCard';
