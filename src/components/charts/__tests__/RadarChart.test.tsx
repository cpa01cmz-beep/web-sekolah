import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RadarChart } from '../RadarChart';

vi.mock('recharts/es6/chart/RadarChart', () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
}));

vi.mock('recharts/es6/polar/Radar', () => ({
  Radar: () => <div data-testid="radar" />,
}));

vi.mock('recharts/es6/polar/PolarGrid', () => ({
  PolarGrid: () => <div data-testid="polar-grid" />,
}));

vi.mock('recharts/es6/polar/PolarAngleAxis', () => ({
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
}));

vi.mock('recharts/es6/polar/PolarRadiusAxis', () => ({
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
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

describe('RadarChart', () => {
  const mockData = [
    { name: 'Math', value: 85 },
    { name: 'Science', value: 90 },
    { name: 'English', value: 75 },
    { name: 'History', value: 80 },
    { name: 'Art', value: 95 },
  ];

  it('renders loading skeleton initially', () => {
    render(<RadarChart data={mockData} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders chart after loading', async () => {
    render(<RadarChart data={mockData} ariaLabel="Subject performance" />);
    
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Subject performance' })).toBeInTheDocument();
    });
  });

  it('renders empty state when data is empty', async () => {
    render(<RadarChart data={[]} emptyMessage="No subjects available" />);
    
    await waitFor(() => {
      expect(screen.getByText('No subjects available')).toBeInTheDocument();
    });
  });

  it('accepts custom props', async () => {
    render(
      <RadarChart
        data={mockData}
        height={400}
        dataKey="value"
        angleKey="name"
        ariaLabel="Performance chart"
        className="custom-class"
        fillOpacity={0.5}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Performance chart' })).toBeInTheDocument();
    });
  });

  it('renders with custom color', async () => {
    render(<RadarChart data={mockData} color="#ff0000" ariaLabel="Custom color chart" />);
    
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Custom color chart' })).toBeInTheDocument();
    });
  });

  it('handles undefined data gracefully', async () => {
    render(<RadarChart data={undefined as unknown as []} emptyMessage="No data" />);
    
    await waitFor(() => {
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });
});
