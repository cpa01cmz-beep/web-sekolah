import { useState, useEffect } from 'react';
import { THEME_COLORS } from '@/theme/colors';

interface ChartComponents {
  BarChart: React.ComponentType<any>;
  Bar: React.ComponentType<any>;
  XAxis: React.ComponentType<any>;
  YAxis: React.ComponentType<any>;
  CartesianGrid: React.ComponentType<any>;
  Tooltip: React.ComponentType<any>;
  Legend: React.ComponentType<any>;
  ResponsiveContainer: React.ComponentType<any>;
}

interface EnrollmentChartProps {
  data: Array<{ name: string; students: number }>;
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  const [Chart, setChart] = useState<ChartComponents | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      import('recharts/es6/chart/BarChart'),
      import('recharts/es6/cartesian/Bar'),
      import('recharts/es6/cartesian/XAxis'),
      import('recharts/es6/cartesian/YAxis'),
      import('recharts/es6/cartesian/CartesianGrid'),
      import('recharts/es6/component/Tooltip'),
      import('recharts/es6/component/Legend'),
      import('recharts/es6/component/ResponsiveContainer'),
    ]).then(([BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer]) => {
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
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !Chart) {
    return <div className="h-[300px] animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <Chart.ResponsiveContainer width="100%" height={300}>
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
}
