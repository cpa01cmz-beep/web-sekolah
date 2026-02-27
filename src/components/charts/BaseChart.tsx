import { useState, useEffect, memo, type ReactNode } from 'react'
import { logger } from '@/lib/logger'
import { CHART_DEFAULTS } from './types'

interface ChartComponents {
  ResponsiveContainer: React.ComponentType<Record<string, unknown>>
}

interface BaseChartProps {
  height?: number
  children: ReactNode
  className?: string
  'aria-label'?: string
}

export const BaseChart = memo(function BaseChart({
  height = CHART_DEFAULTS.responsiveHeight,
  children,
  className,
  'aria-label': ariaLabel,
}: BaseChartProps) {
  const [Chart, setChart] = useState<ChartComponents | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChart = async () => {
      try {
        const { ResponsiveContainer } = await import('recharts/es6/component/ResponsiveContainer')
        setChart({ ResponsiveContainer })
      } catch (error) {
        logger.error('Failed to load chart components:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChart()
  }, [])

  if (isLoading || !Chart) {
    return (
      <div
        className={`animate-pulse motion-reduce:animate-none bg-muted rounded-lg ${className || ''}`}
        style={{ height: `${height}px` }}
        role="status"
        aria-label="Loading chart"
      />
    )
  }

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <Chart.ResponsiveContainer width="100%" height={height}>
        {children as React.ReactNode}
      </Chart.ResponsiveContainer>
    </div>
  )
})
