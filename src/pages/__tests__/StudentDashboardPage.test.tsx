import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StudentDashboardPage } from '../portal/student/StudentDashboardPage'
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

vi.mock('@/components/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children, isLoading, error, data }: any) => {
    if (isLoading) return <div data-testid="loading">Loading...</div>
    if (error) return <div data-testid="error">Error</div>
    if (!data) return <div data-testid="no-data">No Data</div>
    if (typeof children === 'function') {
      return <div data-testid="dashboard-content">{children(data)}</div>
    }
    return <div data-testid="dashboard-content">{children}</div>
  },
}))

vi.mock('@/components/PageHeader', () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

vi.mock('@/components/animations', () => ({
  SlideUp: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="slide-up">{children}</div>
  ),
}))

vi.mock('@/components/dashboard/AnnouncementItem', () => ({
  AnnouncementItem: ({ announcement }: { announcement: any }) => (
    <li data-testid="announcement-item">{announcement.title}</li>
  ),
}))

vi.mock('@/components/dashboard/GradeListItem', () => ({
  GradeListItem: ({ courseName, score }: { courseName: string; score: number }) => (
    <li data-testid="grade-item">
      {courseName}: {score}
    </li>
  ),
}))

vi.mock('@/components/dashboard/ScheduleListItem', () => ({
  ScheduleListItem: ({ item }: { item: any }) => (
    <li data-testid="schedule-item">{item.courseName}</li>
  ),
}))

vi.mock('@/components/dashboard/DashboardCardEmptyState', () => ({
  DashboardCardEmptyState: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
  ),
}))

vi.mock('@/components/dashboard/DashboardStatCard', () => ({
  DashboardStatCard: ({
    title,
    value,
    description,
  }: {
    title: string
    value: string
    description: string
  }) => (
    <div data-testid="stat-card">
      {title}: {value} - {description}
    </div>
  ),
}))

vi.mock('@/components/charts/LineChart', () => ({
  LineChart: ({ data }: { data: any[] }) => (
    <div data-testid="line-chart">{data?.length || 0} data points</div>
  ),
}))

vi.mock('@/components/charts/RadarChart', () => ({
  RadarChart: ({ data }: { data: any[] }) => (
    <div data-testid="radar-chart">{data?.length || 0} data points</div>
  ),
}))

vi.mock('@/theme/colors', () => ({
  CHART_COLORS: {
    primary: '#000000',
    secondary: '#000000',
  },
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

describe('StudentDashboardPage', () => {
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
      render(<StudentDashboardPage />, { wrapper })

      expect(screen.getByTestId('loading')).toBeInTheDocument()
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
      render(<StudentDashboardPage />, { wrapper })

      expect(screen.getByTestId('error')).toBeInTheDocument()
    })
  })

  describe('Empty Data State', () => {
    it('should render no data state', () => {
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<StudentDashboardPage />, { wrapper })

      expect(screen.getByTestId('no-data')).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('should render dashboard with data', () => {
      const mockData: StudentDashboardData = {
        schedule: [
          {
            day: 'Senin',
            time: '08:00 - 09:30',
            courseId: 'math-11',
            courseName: 'Mathematics',
            teacherName: 'Ibu Siti',
          },
        ],
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
        announcements: [
          {
            id: 'a-01',
            title: 'Test Announcement',
            content: 'Test content',
            authorId: 'admin-01',
            createdAt: '2026-01-07T10:00:00.000Z',
            updatedAt: '2026-01-07T10:00:00.000Z',
            authorName: 'Admin',
          },
        ],
      }

      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<StudentDashboardPage />, { wrapper })

      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /student dashboard/i })).toBeInTheDocument()
    })

    it('should render empty states when no data available', () => {
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
      render(<StudentDashboardPage />, { wrapper })

      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
      expect(screen.getAllByTestId('empty-state')).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('should have proper region roles', () => {
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
      render(<StudentDashboardPage />, { wrapper })

      expect(
        screen.getByRole('region', { name: /student dashboard overview/i })
      ).toBeInTheDocument()
    })
  })
})
