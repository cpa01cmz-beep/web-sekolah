import { ReactElement, ReactNode, cloneElement } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  showErrorIcon?: boolean;
}

export function FormField({
  id,
  label,
  error,
  helperText,
  required,
  children,
  className,
  showErrorIcon = true,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = !!error;

  const safeLabel = String(label || '');
  const safeError = error ? String(error) : undefined;
  const safeHelperText = helperText ? String(helperText) : undefined;

  const child = React.Children.only(children) as ReactElement;
  const childProps = child.props || {};

  const enhancedChild = cloneElement(child, {
    id: childProps.id || id,
    'aria-required': childProps['aria-required'] ?? (required ? 'true' : undefined),
    'aria-invalid': childProps['aria-invalid'] ?? (hasError ? 'true' : undefined),
    'aria-describedby': childProps['aria-describedby'] ?? (hasError ? errorId : helperId),
  });

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} id={`${id}-label`} className="text-sm font-medium">
        {safeLabel}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {enhancedChild}
      {safeHelperText && !hasError && (
        <p id={helperId} className="text-xs text-muted-foreground">{safeHelperText}</p>
      )}
      {hasError && (
        <p
          id={errorId}
          className="text-xs text-destructive flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          {showErrorIcon && <AlertCircle className="h-3 w-3" aria-hidden="true" />}
          {safeError}
        </p>
      )}
    </div>
  );
}
