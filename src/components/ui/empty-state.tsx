import { memo } from 'react';
import { LucideIcon, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type EmptyStateVariant = 'default' | 'info' | 'warning' | 'error';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  className?: string;
  variant?: EmptyStateVariant;
}

const variantStyles: Record<EmptyStateVariant, { iconBg: string; iconColor: string; titleColor: string }> = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    titleColor: 'text-foreground',
  },
  info: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-foreground',
  },
  warning: {
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    titleColor: 'text-foreground',
  },
  error: {
    iconBg: 'bg-red-100 dark:bg-red-900/20',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-foreground',
  },
};

const variantIcons: Record<EmptyStateVariant, LucideIcon | undefined> = {
  default: undefined,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const styles = variantStyles[variant];
  const DefaultIcon = variantIcons[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {(Icon || DefaultIcon) && (
        <div className={cn('mb-4 flex h-16 w-16 items-center justify-center rounded-full', styles.iconBg)}>
          <div className="flex items-center justify-center">
            {Icon ? <Icon className={cn('h-8 w-8', styles.iconColor)} aria-hidden="true" /> : <DefaultIcon className={cn('h-8 w-8', styles.iconColor)} aria-hidden="true" />}
          </div>
        </div>
      )}
      <h3 className={cn('text-lg font-semibold', styles.titleColor)}>{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6"
          variant={action.variant || 'default'}
          type="button"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
});
EmptyState.displayName = 'EmptyState';
