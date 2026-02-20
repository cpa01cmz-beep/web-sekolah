import { memo } from 'react';
import { CHART_COLORS, CHART_DEFAULTS, type MultiSeriesDataPoint } from './types';
import { ChartSkeleton } from './ChartSkeleton';
import { useChartComponents } from './chart-hooks';

const ACTIVE_DOT_CONFIG = { r: 6 } as const;

const LINE_CHART_COMPONENTS = [
  'LineChart',
  'Line',
  'XAxis',
  'YAxis',
  'CartesianGrid',
  'Tooltip',
  'Legend',
  'ResponsiveContainer',
] as const;

const DEFAULT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.purple,
  CHART_COLORS.teal,
] as const;

export interface LineSeries {
  dataKey: string;
  name?: string;
  color?: string;
  strokeWidth?: number;
}

export interface LineChartProps {
  data: MultiSeriesDataPoint[];
  series: LineSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showDots?: boolean;
  className?: string;
  ariaLabel?: string;
  emptyMessage?: string;
}

export const LineChart = memo(function LineChart({
  data,
  series,
  xAxisKey = 'name',
  height = CHART_DEFAULTS.responsiveHeight,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showDots = true,
  className,
  ariaLabel = 'Line chart',
  emptyMessage = 'No data available',
}: LineChartProps) {
  const { components: Chart, isLoading } = useChartComponents(LINE_CHART_COMPONENTS);

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
        <Chart.LineChart data={data} margin={CHART_DEFAULTS.margin}>
          {showGrid && <Chart.CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <Chart.XAxis dataKey={xAxisKey} className="text-xs" />
          <Chart.YAxis className="text-xs" />
          {showTooltip && <Chart.Tooltip />}
          {showLegend && <Chart.Legend />}
          {series.map((s, index) => (
            <Chart.Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              stroke={s.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              strokeWidth={s.strokeWidth || CHART_DEFAULTS.strokeWidth}
              dot={showDots}
              activeDot={ACTIVE_DOT_CONFIG}
            />
          ))}
        </Chart.LineChart>
      </Chart.ResponsiveContainer>
    </div>
  );
});
