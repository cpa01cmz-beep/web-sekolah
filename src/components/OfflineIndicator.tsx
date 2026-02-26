import { memo, useCallback, useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

interface OfflineIndicatorProps {
  className?: string
}

const getInitialOnlineStatus = () => {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

export const OfflineIndicator = memo(function OfflineIndicator({
  className = 'fixed bottom-4 right-4',
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  if (isOnline) {
    return null
  }

  return (
    <div
      className={`${className} flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2 text-amber-800 shadow-lg dark:bg-amber-900 dark:text-amber-100`}
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-medium">You are offline</span>
    </div>
  )
})

OfflineIndicator.displayName = 'OfflineIndicator'
