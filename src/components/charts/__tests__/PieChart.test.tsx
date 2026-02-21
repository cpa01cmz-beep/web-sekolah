import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PieChart } from '../PieChart';

vi.mock('recharts/es6/chart/PieChart', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
}));

vi.mock('recharts/es6/polar/Pie', () => ({
  Pie: () => <div data-testid="pie" />,
}));

vi.mock('recharts/es6/component/Cell', () => ({
  Cell: () => <div data-testid="cell" />,
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

describe('PieChart', () => {
  const mockData = [
    { name: 'Category A', value: 30 },
    { name: 'Category B', value: 40 },
    { name: 'Category C', value: 30 },
  ];

  it('renders loading skeleton initially', () => {
    render(<PieChart data={mockData} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders chart after loading', async () => {
    render(<PieChart data={mockData} ariaLabel="Distribution chart" />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Distribution chart' })).toBeInTheDocument();
    });
  });

  it('renders empty state when data is empty', async () => {
    render(<PieChart data={[]} emptyMessage="No distribution data" />);

    await waitFor(() => {
      expect(screen.getByText('No distribution data')).toBeInTheDocument();
    });
  });

  it('accepts custom props', async () => {
    render(
      <PieChart
        data={mockData}
        height={400}
        dataKey="value"
        nameKey="name"
        innerRadius={40}
        outerRadius={100}
        ariaLabel="Distribution chart"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Distribution chart' })).toBeInTheDocument();
    });
  });

  it('handles custom colors', async () => {
    render(
      <PieChart
        data={mockData}
        colors={['#ff0000', '#00ff00', '#0000ff']}
        ariaLabel="Custom colors"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Custom colors' })).toBeInTheDocument();
    });
  });

  it('handles custom colors in data', async () => {
    const dataWithColors = [
      { name: 'A', value: 10, color: '#ff0000' },
      { name: 'B', value: 20, color: '#00ff00' },
    ];
    render(<PieChart data={dataWithColors} ariaLabel="Data colors" />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Data colors' })).toBeInTheDocument();
    });
  });
});
