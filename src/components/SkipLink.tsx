import { cn } from '@/lib/utils';

interface SkipLinkProps {
  targetId: string;
  className?: string;
}

export function SkipLink({ targetId, className }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md',
        className
      )}
    >
      Skip to main content
    </a>
  );
}
