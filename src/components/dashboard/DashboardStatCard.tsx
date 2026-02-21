import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  valueSize?: '2xl' | '3xl';
  className?: string;
}

export const DashboardStatCard = memo(function DashboardStatCard({
  title,
  value,
  icon,
  subtitle,
  valueSize = '2xl',
  className,
}: DashboardStatCardProps) {
  return (
    <Card className={cn('h-full hover:shadow-lg transition-shadow duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <span aria-hidden="true">{icon}</span>}
      </CardHeader>
      <CardContent>
        <div className={cn('font-bold', valueSize === '2xl' ? 'text-2xl' : 'text-3xl')}>
          {value}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
});
DashboardStatCard.displayName = 'DashboardStatCard';
