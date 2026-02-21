import { memo } from 'react';
import { CHART_COLORS, CHART_DEFAULTS, type ChartDataPoint } from './types';
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

export interface RadarChartProps {
  data: ChartDataPoint[];
  dataKey?: string;
  angleKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  ariaLabel?: string;
  emptyMessage?: string;
  fillOpacity?: number;
}

export const RadarChart = memo(function RadarChart({
  data,
  dataKey = 'value',
  angleKey = 'name',
  color = CHART_COLORS.primary,
  height = CHART_DEFAULTS.responsiveHeight,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  className,
  ariaLabel = 'Radar chart',
  emptyMessage = 'No data available',
  fillOpacity = 0.3,
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
          <Chart.Radar
            name={dataKey}
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={fillOpacity}
          />
        </Chart.RadarChart>
      </Chart.ResponsiveContainer>
    </div>
  );
});
