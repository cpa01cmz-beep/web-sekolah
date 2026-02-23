import { memo } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ScheduleSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertTriangle, Calendar, RefreshCw } from 'lucide-react'

interface ScheduleLayoutProps<T> {
  isLoading: boolean
  error: Error | null
  data: T | undefined
  children: React.ReactNode | ((data: T) => React.ReactNode)
  onRetry?: () => void
}

function ScheduleLayoutInner<T>({
  isLoading,
  error,
  data,
  children,
  onRetry,
}: ScheduleLayoutProps<T>) {
  if (isLoading) {
    return (
      <div
        className="space-y-6"
        role="status"
        aria-label="Loading schedule data"
        aria-live="polite"
      >
        <Skeleton className="h-9 w-1/3" aria-hidden="true" />
        <ScheduleSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load schedule data. Please try again later.</AlertDescription>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Retry
          </Button>
        )}
      </Alert>
    )
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <EmptyState
        icon={Calendar}
        title="No schedule available"
        description="There are no scheduled classes to display."
        variant="info"
      />
    )
  }

  if (typeof children === 'function') {
    return <>{children(data)}</>
  }

  return <>{children}</>
}

export const ScheduleLayout = memo(ScheduleLayoutInner) as <T>(
  props: ScheduleLayoutProps<T>
) => React.ReactElement

ScheduleLayout.displayName = 'ScheduleLayout'
