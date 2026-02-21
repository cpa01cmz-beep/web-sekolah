import { memo } from 'react';
import { useRecharts } from '@/hooks/useRecharts';
import { THEME_COLORS } from '@/theme/colors';

interface EnrollmentChartProps {
  data: Array<{ name: string; students: number }>;
}

const RECHARTS_COMPONENTS = [
  'BarChart',
  'Bar',
  'XAxis',
  'YAxis',
  'CartesianGrid',
  'Tooltip',
  'Legend',
  'ResponsiveContainer',
] as const;

export const EnrollmentChart = memo(function EnrollmentChart({ data }: EnrollmentChartProps) {
  const { components: Chart, isLoading, error } = useRecharts({
    components: [...RECHARTS_COMPONENTS],
  });

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

  if (error) {
    return (
      <div
        className="h-[300px] flex items-center justify-center text-muted-foreground"
        role="alert"
        aria-label="Failed to load enrollment chart"
      >
        Failed to load chart
      </div>
    );
  }

  return (
    <Chart.ResponsiveContainer width="100%" height={300} role="img" aria-label="User distribution bar chart">
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
