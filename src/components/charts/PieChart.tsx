import { memo } from 'react'
import { CHART_COLORS, CHART_DEFAULTS, type ChartDataPoint } from './types'
import { ChartSkeleton } from './ChartSkeleton'
import { useChartComponents } from './chart-hooks'

const PIE_CHART_COMPONENTS = [
  'PieChart',
  'Pie',
  'Cell',
  'Tooltip',
  'Legend',
  'ResponsiveContainer',
] as const

export interface PieChartProps {
  data: ChartDataPoint[]
  dataKey?: string
  nameKey?: string
  height?: number
  innerRadius?: number | string
  outerRadius?: number | string
  showLegend?: boolean
  showTooltip?: boolean
  showLabels?: boolean
  className?: string
  ariaLabel?: string
  emptyMessage?: string
  colors?: string[]
}

const DEFAULT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.purple,
  CHART_COLORS.teal,
  CHART_COLORS.pink,
  CHART_COLORS.orange,
]

export const PieChart = memo(function PieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = CHART_DEFAULTS.responsiveHeight,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  className,
  ariaLabel = 'Pie chart',
  emptyMessage = 'No data available',
  colors = DEFAULT_COLORS,
}: PieChartProps) {
  const { components: Chart, isLoading } = useChartComponents(PIE_CHART_COMPONENTS)

  if (isLoading) {
    return <ChartSkeleton height={height} className={className} />
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className || ''}`}
        style={{ height: `${height}px` }}
        role="status"
      >
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  if (!Chart) {
    return <ChartSkeleton height={height} className={className} />
  }

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <Chart.ResponsiveContainer width="100%" height={height}>
        <Chart.PieChart>
          {showTooltip && <Chart.Tooltip />}
          {showLegend && <Chart.Legend />}
          <Chart.Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            label={showLabels}
          >
            {data.map((entry, index) => (
              <Chart.Cell
                key={`cell-${index}`}
                fill={typeof entry.color === 'string' ? entry.color : colors[index % colors.length]}
              />
            ))}
          </Chart.Pie>
        </Chart.PieChart>
      </Chart.ResponsiveContainer>
    </div>
  )
})
