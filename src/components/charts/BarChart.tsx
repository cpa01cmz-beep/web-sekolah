import { memo } from 'react';
import { CHART_COLORS, CHART_DEFAULTS, type ChartDataPoint } from './types';
import { ChartSkeleton } from './ChartSkeleton';
import { useChartComponents } from './chart-hooks';

const BAR_CHART_COMPONENTS = [
  'BarChart',
  'Bar',
  'XAxis',
  'YAxis',
  'CartesianGrid',
  'Tooltip',
  'Legend',
  'ResponsiveContainer',
  'Cell',
] as const;

export interface BarChartProps {
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  ariaLabel?: string;
  emptyMessage?: string;
}

export const BarChart = memo(function BarChart({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  color = CHART_COLORS.primary,
  height = CHART_DEFAULTS.responsiveHeight,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  className,
  ariaLabel = 'Bar chart',
  emptyMessage = 'No data available',
}: BarChartProps) {
  const { components: Chart, isLoading } = useChartComponents(BAR_CHART_COMPONENTS);

  if (isLoading) {
    return <ChartSkeleton height={height} className={className} />;
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
    );
  }

  if (!Chart) {
    return <ChartSkeleton height={height} className={className} />;
  }

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <Chart.ResponsiveContainer width="100%" height={height}>
        <Chart.BarChart data={data} margin={CHART_DEFAULTS.margin}>
          {showGrid && <Chart.CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <Chart.XAxis dataKey={xAxisKey} className="text-xs" />
          <Chart.YAxis className="text-xs" />
          {showTooltip && <Chart.Tooltip />}
          {showLegend && <Chart.Legend />}
          <Chart.Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Chart.Cell
                key={`cell-${index}`}
                fill={typeof entry.color === 'string' ? entry.color : color}
              />
            ))}
          </Chart.Bar>
        </Chart.BarChart>
      </Chart.ResponsiveContainer>
    </div>
  );
});
