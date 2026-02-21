import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BarChart } from '../BarChart';

vi.mock('recharts/es6/chart/BarChart', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
}));

vi.mock('recharts/es6/cartesian/Bar', () => ({
  Bar: () => <div data-testid="bar" />,
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

vi.mock('recharts/es6/component/Cell', () => ({
  Cell: () => <div data-testid="cell" />,
}));

describe('BarChart', () => {
  const mockData = [
    { name: 'Jan', value: 10 },
    { name: 'Feb', value: 20 },
    { name: 'Mar', value: 30 },
  ];

  it('renders loading skeleton initially', () => {
    render(<BarChart data={mockData} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders chart after loading', async () => {
    render(<BarChart data={mockData} ariaLabel="Test chart" />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Test chart' })).toBeInTheDocument();
    });
  });

  it('renders empty state when data is empty', async () => {
    render(<BarChart data={[]} emptyMessage="No data to display" />);

    await waitFor(() => {
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });
  });

  it('accepts custom props', async () => {
    render(
      <BarChart
        data={mockData}
        height={400}
        dataKey="value"
        xAxisKey="name"
        ariaLabel="Test chart"
        className="custom-class"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Test chart' })).toBeInTheDocument();
    });
  });

  it('handles custom colors in data', async () => {
    const dataWithColors = [
      { name: 'A', value: 10, color: '#ff0000' },
      { name: 'B', value: 20, color: '#00ff00' },
    ];
    render(<BarChart data={dataWithColors} ariaLabel="Color test" />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Color test' })).toBeInTheDocument();
    });
  });
});
