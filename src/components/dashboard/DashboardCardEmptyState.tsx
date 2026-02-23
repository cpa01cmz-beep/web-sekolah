import { memo } from 'react'
import { LucideIcon, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardCardEmptyStateProps {
  message: string
  className?: string
  icon?: LucideIcon
}

export const DashboardCardEmptyState = memo(function DashboardCardEmptyState({
  message,
  className,
  icon: Icon = Inbox,
}: DashboardCardEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-4', className)} role="status">
      <Icon className="h-8 w-8 text-muted-foreground/50 mb-2" aria-hidden="true" />
      <p className="text-sm text-muted-foreground text-center">{message}</p>
    </div>
  )
})
DashboardCardEmptyState.displayName = 'DashboardCardEmptyState'
