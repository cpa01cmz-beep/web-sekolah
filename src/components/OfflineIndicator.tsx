import { memo, useEffect, useState, useCallback } from 'react'
import { WifiOff } from 'lucide-react'

export const OfflineIndicator = memo(function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const handleOnline = useCallback(() => {
    setIsOffline(false)
  }, [])

  const handleOffline = useCallback(() => {
    setIsOffline(true)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  if (!isOffline) {
    return null
  }

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-lg animate-in slide-in-from-bottom-4"
      role="status"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>You are offline. Some features may be limited.</span>
    </div>
  )
})
