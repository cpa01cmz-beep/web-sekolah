import * as React from 'react'
import { WifiOff, Wifi } from 'lucide-react'

import { cn } from '@/lib/utils'

interface OfflineIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  showWhenOnline?: boolean
}

const OfflineIndicator = React.forwardRef<HTMLDivElement, OfflineIndicatorProps>(
  ({ className, showWhenOnline = false, ...props }, ref) => {
    const [isOnline, setIsOnline] = React.useState(
      typeof navigator !== 'undefined' ? navigator.onLine : true
    )

    React.useEffect(() => {
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }, [])

    if (isOnline && !showWhenOnline) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg',
          isOnline
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
          className
        )}
        {...props}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You are offline</span>
          </>
        )}
      </div>
    )
  }
)
OfflineIndicator.displayName = 'OfflineIndicator'

export { OfflineIndicator }
