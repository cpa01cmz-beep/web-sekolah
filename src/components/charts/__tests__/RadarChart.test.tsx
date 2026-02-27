import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RadarChart } from '../RadarChart'

vi.mock('recharts/es6/chart/RadarChart', () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radar-chart">{children}</div>
  ),
}))

vi.mock('recharts/es6/polar/Radar', () => ({
  Radar: () => <div data-testid="radar" />,
}))

vi.mock('recharts/es6/polar/PolarGrid', () => ({
  PolarGrid: () => <div data-testid="polar-grid" />,
}))

vi.mock('recharts/es6/polar/PolarAngleAxis', () => ({
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
}))

vi.mock('recharts/es6/polar/PolarRadiusAxis', () => ({
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
}))

vi.mock('recharts/es6/component/Tooltip', () => ({
  Tooltip: () => <div data-testid="tooltip" />,
}))

vi.mock('recharts/es6/component/Legend', () => ({
  Legend: () => <div data-testid="legend" />,
}))

vi.mock('recharts/es6/component/ResponsiveContainer', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

describe('RadarChart', () => {
  const mockData = [
    { name: 'Math', value1: 80, value2: 70 },
    { name: 'Science', value1: 85, value2: 75 },
    { name: 'English', value1: 90, value2: 80 },
  ]

  const mockSeries = [
    { dataKey: 'value1', name: 'Student A' },
    { dataKey: 'value2', name: 'Student B' },
  ]

  it('renders loading skeleton initially', () => {
    render(<RadarChart data={mockData} series={mockSeries} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders chart after loading', async () => {
    render(<RadarChart data={mockData} series={mockSeries} ariaLabel="Subject comparison" />)

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Subject comparison' })).toBeInTheDocument()
    })
  })

  it('renders empty state when data is empty', async () => {
    render(<RadarChart data={[]} series={mockSeries} emptyMessage="No comparison data" />)

    await waitFor(() => {
      expect(screen.getByText('No comparison data')).toBeInTheDocument()
    })
  })

  it('accepts custom props', async () => {
    render(
      <RadarChart
        data={mockData}
        series={mockSeries}
        height={400}
        angleKey="name"
        showLegend={false}
        ariaLabel="Subject comparison"
        className="custom-class"
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Subject comparison' })).toBeInTheDocument()
    })
  })

  it('handles custom series colors and fillOpacity', async () => {
    const seriesWithColors = [{ dataKey: 'value1', color: '#ff0000', fillOpacity: 0.5 }]
    render(<RadarChart data={mockData} series={seriesWithColors} ariaLabel="Custom colors" />)

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Custom colors' })).toBeInTheDocument()
    })
  })
})
