import { useState, useEffect, memo } from 'react';
import { THEME_COLORS } from '@/theme/colors';
import { logger } from '@/lib/logger';

interface ChartComponents {
  BarChart: React.ComponentType<Record<string, unknown>>;
  Bar: React.ComponentType<Record<string, unknown>>;
  XAxis: React.ComponentType<Record<string, unknown>>;
  YAxis: React.ComponentType<Record<string, unknown>>;
  CartesianGrid: React.ComponentType<Record<string, unknown>>;
  Tooltip: React.ComponentType<Record<string, unknown>>;
  Legend: React.ComponentType<Record<string, unknown>>;
  ResponsiveContainer: React.ComponentType<Record<string, unknown>>;
}

interface EnrollmentChartProps {
  data: Array<{ name: string; students: number }>;
}

export const EnrollmentChart = memo(function EnrollmentChart({ data }: EnrollmentChartProps) {
  const [Chart, setChart] = useState<ChartComponents | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChartComponents = async () => {
      try {
        const [BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer] =
          await Promise.all([
            import('recharts/es6/chart/BarChart'),
            import('recharts/es6/cartesian/Bar'),
            import('recharts/es6/cartesian/XAxis'),
            import('recharts/es6/cartesian/YAxis'),
            import('recharts/es6/cartesian/CartesianGrid'),
            import('recharts/es6/component/Tooltip'),
            import('recharts/es6/component/Legend'),
            import('recharts/es6/component/ResponsiveContainer'),
          ]);
        setChart({
          BarChart: BarChart.BarChart,
          Bar: Bar.Bar,
          XAxis: XAxis.XAxis,
          YAxis: YAxis.YAxis,
          CartesianGrid: CartesianGrid.CartesianGrid,
          Tooltip: Tooltip.Tooltip,
          Legend: Legend.Legend,
          ResponsiveContainer: ResponsiveContainer.ResponsiveContainer,
        });
      } catch (error) {
        logger.error('Failed to load chart components:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartComponents();
  }, []);

  if (isLoading || !Chart) {
    return (
      <div
        className="h-[300px] animate-pulse bg-muted rounded-lg"
        role="status"
        aria-busy="true"
        aria-label="Loading enrollment chart"
      />
    );
  }

  return (
    <Chart.ResponsiveContainer
      width="100%"
      height={300}
      role="img"
      aria-label="User distribution bar chart"
    >
      <Chart.BarChart data={data}>
        <Chart.CartesianGrid strokeDasharray="3 3" />
        <Chart.XAxis dataKey="name" />
        <Chart.YAxis />
        <Chart.Tooltip />
        <Chart.Legend />
        <Chart.Bar dataKey="students" fill={THEME_COLORS.PRIMARY} />
      </Chart.BarChart>
    </Chart.ResponsiveContainer>
  );
});
