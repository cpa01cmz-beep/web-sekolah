import { memo } from 'react'
import { Skeleton } from './skeleton'
import { Card, CardContent, CardHeader } from './card'

export const TableSkeleton = memo(function TableSkeleton({
  columns = 4,
  rows = 5,
  showHeader = true,
}: {
  columns?: number
  rows?: number
  showHeader?: boolean
}) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table data" aria-live="polite">
      {showHeader && (
        <div className="flex gap-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-6 flex-1" aria-hidden="true" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-10 w-full"
              aria-hidden="true"
            />
          ))}
        </div>
      ))}
    </div>
  )
})

export const DashboardSkeleton = memo(function DashboardSkeleton({
  cards = 3,
  showTitle = true,
  showSubtitle = true,
}: {
  cards?: number
  showTitle?: boolean
  showSubtitle?: boolean
}) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard data" aria-live="polite">
      {showTitle && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" aria-hidden="true" />
          {showSubtitle && <Skeleton className="h-4 w-3/4" aria-hidden="true" />}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" aria-hidden="true" />
              <Skeleton className="h-16 w-full" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
})

export const CardSkeleton = memo(function CardSkeleton({
  lines = 3,
  showHeader = true,
}: {
  lines?: number
  showHeader?: boolean
}) {
  return (
    <Card role="status" aria-label="Loading card content" aria-live="polite">
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-1/3" aria-hidden="true" />
          <Skeleton className="h-4 w-1/2 mt-2" aria-hidden="true" />
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" aria-hidden="true" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

const SCHEDULE_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const

export const ScheduleSkeleton = memo(function ScheduleSkeleton({
  days = SCHEDULE_DAYS,
  itemsPerDay = 3,
}: {
  days?: readonly string[]
  itemsPerDay?: number
}) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      role="status"
      aria-label="Loading schedule data"
      aria-live="polite"
    >
      {days.map(day => (
        <Card key={day} className="h-full">
          <CardHeader>
            <Skeleton className="h-6 w-1/3" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: itemsPerDay }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-12 w-24 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" aria-hidden="true" />
                    <Skeleton className="h-3 w-2/3" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

export const AnnouncementSkeleton = memo(function AnnouncementSkeleton({
  title = 'Announcements',
}: {
  title?: string
}) {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading announcements data"
      aria-live="polite"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" aria-hidden="true" />
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <CardSkeleton lines={2} />
        </div>
        <div className="md:col-span-2">
          <CardSkeleton lines={5} />
        </div>
      </div>
    </div>
  )
})
