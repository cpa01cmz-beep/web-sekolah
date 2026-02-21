import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LineChart } from '../LineChart';

vi.mock('recharts/es6/chart/LineChart', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
}));

vi.mock('recharts/es6/cartesian/Line', () => ({
  Line: () => <div data-testid="line" />,
}));

vi.mock('recharts/es6/cartesian/XAxis', () => ({
  XAxis: () => <div data-testid="x-axis" />,
}));

vi.mock('recharts/es6/cartesian/YAxis', () => ({
  YAxis: () => <div data-testid="y-axis" />,
}));

vi.mock('recharts/es6/cartesian/CartesianGrid', () => ({
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

vi.mock('recharts/es6/component/Tooltip', () => ({
  Tooltip: () => <div data-testid="tooltip" />,
}));

vi.mock('recharts/es6/component/Legend', () => ({
  Legend: () => <div data-testid="legend" />,
}));

vi.mock('recharts/es6/component/ResponsiveContainer', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('LineChart', () => {
  const mockData = [
    { name: 'Jan', value1: 10, value2: 20 },
    { name: 'Feb', value1: 15, value2: 25 },
    { name: 'Mar', value1: 20, value2: 30 },
  ];

  const mockSeries = [
    { dataKey: 'value1', name: 'Series 1' },
    { dataKey: 'value2', name: 'Series 2' },
  ];

  it('renders loading skeleton initially', () => {
    render(<LineChart data={mockData} series={mockSeries} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders chart after loading', async () => {
    render(<LineChart data={mockData} series={mockSeries} ariaLabel="Trend chart" />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Trend chart' })).toBeInTheDocument();
    });
  });

  it('renders empty state when data is empty', async () => {
    render(<LineChart data={[]} series={mockSeries} emptyMessage="No trend data" />);

    await waitFor(() => {
      expect(screen.getByText('No trend data')).toBeInTheDocument();
    });
  });

  it('accepts custom props', async () => {
    render(
      <LineChart
        data={mockData}
        series={mockSeries}
        height={400}
        xAxisKey="name"
        showDots={false}
        showLegend={false}
        ariaLabel="Trend chart"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Trend chart' })).toBeInTheDocument();
    });
  });

  it('handles custom series colors', async () => {
    const seriesWithColors = [{ dataKey: 'value1', color: '#ff0000', strokeWidth: 3 }];
    render(<LineChart data={mockData} series={seriesWithColors} ariaLabel="Custom colors" />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Custom colors' })).toBeInTheDocument();
    });
  });
});
