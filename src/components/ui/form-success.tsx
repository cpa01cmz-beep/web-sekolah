import { memo } from 'react';
import { LucideIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormSuccessProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const FormSuccess = memo(function FormSuccess({
  icon: Icon = CheckCircle,
  title,
  description,
  action,
  className,
}: FormSuccessProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <Icon className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11 px-8 bg-primary text-primary-foreground shadow hover:bg-primary/90"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
});
FormSuccess.displayName = 'FormSuccess';
