import { memo } from 'react'
import { CHART_COLORS, CHART_DEFAULTS } from '@/components/charts/types'
import { ChartSkeleton } from '@/components/charts/ChartSkeleton'
import { useChartComponents } from '@/components/charts/chart-hooks'

interface EnrollmentChartProps {
  data: Array<{ name: string; students: number }>
}

const ENROLLMENT_CHART_COMPONENTS = [
  'BarChart',
  'Bar',
  'XAxis',
  'YAxis',
  'CartesianGrid',
  'Tooltip',
  'Legend',
  'ResponsiveContainer',
] as const

export const EnrollmentChart = memo(function EnrollmentChart({ data }: EnrollmentChartProps) {
  const { components: Chart, isLoading } = useChartComponents(ENROLLMENT_CHART_COMPONENTS)

  if (isLoading) {
    return <ChartSkeleton height={CHART_DEFAULTS.responsiveHeight} />
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ height: `${CHART_DEFAULTS.responsiveHeight}px` }}
        role="status"
      >
        <p className="text-sm text-muted-foreground">No enrollment data available</p>
      </div>
    )
  }

  if (!Chart) {
    return <ChartSkeleton height={CHART_DEFAULTS.responsiveHeight} />
  }

  return (
    <div role="img" aria-label="User distribution bar chart">
      <Chart.ResponsiveContainer width="100%" height={CHART_DEFAULTS.responsiveHeight}>
        <Chart.BarChart data={data} margin={CHART_DEFAULTS.margin}>
          <Chart.CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <Chart.XAxis dataKey="name" className="text-xs" />
          <Chart.YAxis className="text-xs" />
          <Chart.Tooltip />
          <Chart.Legend />
          <Chart.Bar dataKey="students" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
        </Chart.BarChart>
      </Chart.ResponsiveContainer>
    </div>
  )
})
