import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StudentGradesPage } from '../portal/student/StudentGradesPage'
import type { StudentDashboardData, BaseUser } from '@shared/types'

vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: 'student-01',
      name: 'Test Student',
      email: 'test@school.id',
      role: 'student',
    } as BaseUser,
  })),
}))

vi.mock('@/hooks/useStudent', () => ({
  useStudentDashboard: vi.fn(),
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
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
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

vi.mock('@/components/ui/loading-skeletons', () => ({
  CardSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
  AlertTitle: ({ children }: { children: React.ReactNode }) => (
    <h4 data-testid="alert-title">{children}</h4>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="alert-description">{children}</p>
  ),
}))

vi.mock('@/components/ui/responsive-table', () => ({
  ResponsiveTable: ({ headers, rows }: { headers: any; rows: any }) => (
    <div data-testid="responsive-table">
      <span data-testid="headers-count">{headers.length}</span>
      <span data-testid="rows-count">{rows.length}</span>
    </div>
  ),
}))

vi.mock('@/components/charts/PieChart', () => ({
  PieChart: () => <div data-testid="pie-chart">PieChart</div>,
}))

vi.mock('@/utils/grades', () => ({
  calculateAverageScore: vi.fn((grades: { score: number }[]) => {
    if (grades.length === 0) return '-'
    const sum = grades.reduce((acc, g) => acc + g.score, 0)
    return Math.round(sum / grades.length)
  }),
  getGradeColorClass: vi.fn(() => 'bg-green-500'),
  getGradeLetter: vi.fn((score: number) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }),
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

  describe('Success State', () => {
    it('should render grades page with data', () => {
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
          {
            id: 'g-02',
            studentId: 'student-01',
            courseId: 'eng-11',
            score: 88,
            feedback: 'Good job!',
            createdAt: '2026-01-07T10:00:00.000Z',
            updatedAt: '2026-01-07T10:00:00.000Z',
            courseName: 'English',
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
      expect(screen.getByRole('heading', { name: /rapor akademik/i })).toBeInTheDocument()
      expect(screen.getByTestId('rows-count')).toHaveTextContent('2')
    })

    it('should render average score', () => {
      const mockData: StudentDashboardData = {
        schedule: [],
        recentGrades: [
          {
            id: 'g-01',
            studentId: 'student-01',
            courseId: 'math-11',
            score: 90,
            feedback: 'Great!',
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

      expect(screen.getByTestId('responsive-table')).toBeInTheDocument()
    })

    it('should render grade distribution chart when grades exist', () => {
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

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getAllByTestId('card-title')[1]).toHaveTextContent('Distribusi Nilai')
    })

    it('should render empty state when no grades', () => {
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

      expect(screen.getByText(/no grades available/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
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

      expect(screen.getByRole('heading', { name: /rapor akademik/i })).toBeInTheDocument()
    })
  })
})
