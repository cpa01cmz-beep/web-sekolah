import { WifiOff } from 'lucide-react'
import { useOffline } from '@/hooks/use-offline'

export function OfflineIndicator() {
  const isOffline = useOffline()

  if (!isOffline) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white shadow-lg">
      <WifiOff className="h-4 w-4" />
      <span>You are offline</span>
    </div>
  )
}
