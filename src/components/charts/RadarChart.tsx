import { memo } from 'react';
import { CHART_COLORS, CHART_DEFAULTS, type MultiSeriesDataPoint } from './types';
import { ChartSkeleton } from './ChartSkeleton';
import { useChartComponents } from './chart-hooks';

const RADAR_CHART_COMPONENTS = [
  'RadarChart',
  'Radar',
  'PolarGrid',
  'PolarAngleAxis',
  'PolarRadiusAxis',
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

export interface RadarSeries {
  dataKey: string;
  name?: string;
  color?: string;
  fillOpacity?: number;
}

export interface RadarChartProps {
  data: MultiSeriesDataPoint[];
  series: RadarSeries[];
  angleKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  ariaLabel?: string;
  emptyMessage?: string;
}

export const RadarChart = memo(function RadarChart({
  data,
  series,
  angleKey = 'name',
  height = CHART_DEFAULTS.responsiveHeight,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className,
  ariaLabel = 'Radar chart',
  emptyMessage = 'No data available',
}: RadarChartProps) {
  const { components: Chart, isLoading } = useChartComponents(RADAR_CHART_COMPONENTS);

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
        <Chart.RadarChart data={data} margin={CHART_DEFAULTS.margin}>
          {showGrid && <Chart.PolarGrid className="stroke-muted" />}
          <Chart.PolarAngleAxis dataKey={angleKey} className="text-xs" />
          <Chart.PolarRadiusAxis className="text-xs" />
          {showTooltip && <Chart.Tooltip />}
          {showLegend && <Chart.Legend />}
          {series.map((s, index) => (
            <Chart.Radar
              key={s.dataKey}
              name={s.name || s.dataKey}
              dataKey={s.dataKey}
              stroke={s.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              fill={s.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              fillOpacity={s.fillOpacity ?? 0.3}
            />
          ))}
        </Chart.RadarChart>
      </Chart.ResponsiveContainer>
    </div>
  );
});
