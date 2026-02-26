import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StudentGradesPage } from '../portal/student/StudentGradesPage'
import type { StudentDashboardData } from '@shared/types'

vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'student-01', name: 'Test Student', email: 'test@school.id', role: 'student' },
  })),
}))

vi.mock('@/hooks/useStudent', () => ({
  useStudentDashboard: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/components/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
    </div>
  ),
}))

vi.mock('@/components/animations', () => ({
  SlideUp: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="slide-up">{children}</div>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}))

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertTitle: ({ children }: { children: React.ReactNode }) => (
    <h4 data-testid="alert-title">{children}</h4>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="alert-description">{children}</p>
  ),
}))

vi.mock('@/components/ui/loading-skeletons', () => ({
  CardSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

vi.mock('@/components/ui/responsive-table', () => ({
  ResponsiveTable: ({ headers, rows }: { headers: any[]; rows: any[] }) => (
    <div data-testid="table">
      <div data-testid="headers">{headers.length}</div>
      <div data-testid="rows">{rows.length}</div>
    </div>
  ),
}))

vi.mock('@/components/charts/PieChart', () => ({
  PieChart: () => <div data-testid="pie-chart">Chart</div>,
}))

vi.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="alert-triangle">AlertTriangle</span>,
  PieChart: () => <span data-testid="pie-chart-icon">PieChart</span>,
}))

const createWrapper = () => {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )
  }
}

import { useStudentDashboard } from '@/hooks/useStudent'

describe('StudentGradesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should render loading state', () => {
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<StudentGradesPage />, { wrapper })

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should render error state', () => {
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
      } as any)

      const wrapper = createWrapper()
      render(<StudentGradesPage />, { wrapper })

      expect(screen.getByTestId('alert')).toBeInTheDocument()
      expect(screen.getByTestId('alert-title')).toHaveTextContent('Error')
    })
  })

  describe('Success State with Data', () => {
    it('should render grades table with data', () => {
      const mockData: StudentDashboardData = {
        schedule: [],
        recentGrades: [
          {
            id: 'g-01',
            studentId: 'student-01',
            courseId: 'math-11',
            score: 95,
            feedback: 'Excellent!',
            createdAt: '2026-01-07T10:00:00.000Z',
            updatedAt: '2026-01-07T10:00:00.000Z',
            courseName: 'Mathematics',
          },
        ],
        announcements: [],
      }

      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<StudentGradesPage />, { wrapper })

      expect(screen.getByTestId('page-header')).toBeInTheDocument()
      expect(screen.getByTestId('table')).toBeInTheDocument()
    })

    it('should render empty state message when no grades', () => {
      const mockData: StudentDashboardData = {
        schedule: [],
        recentGrades: [],
        announcements: [],
      }

      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<StudentGradesPage />, { wrapper })

      expect(screen.getByText(/no grades/i)).toBeInTheDocument()
    })
  })
})
