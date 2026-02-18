import { memo, useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { CHART_COLORS, CHART_DEFAULTS, type MultiSeriesDataPoint } from './types';
import { ChartSkeleton } from './ChartSkeleton';

interface ChartComponents {
  LineChart: React.ComponentType<Record<string, unknown>>;
  Line: React.ComponentType<Record<string, unknown>>;
  XAxis: React.ComponentType<Record<string, unknown>>;
  YAxis: React.ComponentType<Record<string, unknown>>;
  CartesianGrid: React.ComponentType<Record<string, unknown>>;
  Tooltip: React.ComponentType<Record<string, unknown>>;
  Legend: React.ComponentType<Record<string, unknown>>;
  ResponsiveContainer: React.ComponentType<Record<string, unknown>>;
}

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
  const [Chart, setChart] = useState<ChartComponents | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChartComponents = async () => {
      try {
        const [LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer] = await Promise.all([
          import('recharts/es6/chart/LineChart'),
          import('recharts/es6/cartesian/Line'),
          import('recharts/es6/cartesian/XAxis'),
          import('recharts/es6/cartesian/YAxis'),
          import('recharts/es6/cartesian/CartesianGrid'),
          import('recharts/es6/component/Tooltip'),
          import('recharts/es6/component/Legend'),
          import('recharts/es6/component/ResponsiveContainer'),
        ]);
        setChart({
          LineChart: LineChart.LineChart,
          Line: Line.Line,
          XAxis: XAxis.XAxis,
          YAxis: YAxis.YAxis,
          CartesianGrid: CartesianGrid.CartesianGrid,
          Tooltip: Tooltip.Tooltip,
          Legend: Legend.Legend,
          ResponsiveContainer: ResponsiveContainer.ResponsiveContainer,
        });
      } catch (error) {
        logger.error('Failed to load line chart components:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartComponents();
  }, []);

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

  const defaultColors = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.purple,
    CHART_COLORS.teal,
  ];

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
              stroke={s.color || defaultColors[index % defaultColors.length]}
              strokeWidth={s.strokeWidth || CHART_DEFAULTS.strokeWidth}
              dot={showDots}
              activeDot={{ r: 6 }}
            />
          ))}
        </Chart.LineChart>
      </Chart.ResponsiveContainer>
    </div>
  );
});
