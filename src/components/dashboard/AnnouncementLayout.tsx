import { memo } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AnnouncementSkeleton } from '@/components/ui/loading-skeletons'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AnnouncementLayoutProps {
  isLoading: boolean
  error: Error | null
  children: React.ReactNode
  onRetry?: () => void
}

function AnnouncementLayoutInner({ isLoading, error, children, onRetry }: AnnouncementLayoutProps) {
  if (isLoading) {
    return <AnnouncementSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load announcements. Please try again later.</AlertDescription>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Retry
          </Button>
        )}
      </Alert>
    )
  }

  return <>{children}</>
}

export const AnnouncementLayout = memo(AnnouncementLayoutInner)

AnnouncementLayout.displayName = 'AnnouncementLayout'
