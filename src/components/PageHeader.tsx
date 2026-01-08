import { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
  'aria-label'?: string;
}

export const PageHeader = memo(function PageHeader({ title, description, className, children, 'aria-label': ariaLabel }: PageHeaderProps) {
  const label = ariaLabel || `${title} page`;
  return (
    <header className={cn('mb-6', className)} aria-label={label}>
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
});
