import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DashboardStatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  subtitle?: string
  valueSize?: '2xl' | '3xl'
  className?: string
  loading?: boolean
}

export const DashboardStatCard = memo(function DashboardStatCard({
  title,
  value,
  icon,
  subtitle,
  valueSize = '2xl',
  className,
  loading = false,
}: DashboardStatCardProps) {
  if (loading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className={cn('h-8', valueSize === '2xl' ? 'w-16' : 'w-20')} />
          {subtitle && <Skeleton className="h-3 w-32 mt-2" />}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('h-full hover:shadow-lg transition-shadow duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <span aria-hidden="true">{icon}</span>}
      </CardHeader>
      <CardContent>
        <div className={cn('font-bold', valueSize === '2xl' ? 'text-2xl' : 'text-3xl')}>
          {value}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
})
DashboardStatCard.displayName = 'DashboardStatCard'
