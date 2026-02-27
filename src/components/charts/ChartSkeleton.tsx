import { memo } from 'react'
import { CHART_DEFAULTS } from './types'

interface ChartSkeletonProps {
  height?: number
  className?: string
}

export const ChartSkeleton = memo(function ChartSkeleton({
  height = CHART_DEFAULTS.responsiveHeight,
  className,
}: ChartSkeletonProps) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none bg-muted rounded-lg ${className || ''}`}
      style={{ height: `${height}px` }}
      role="status"
      aria-label="Loading chart"
    />
  )
})
