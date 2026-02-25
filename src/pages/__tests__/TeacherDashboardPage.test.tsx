import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { TeacherDashboardPage } from '../portal/teacher/TeacherDashboardPage'
import type { TeacherDashboardData, BaseUser } from '@shared/types'

vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: 'teacher-01',
      name: 'Test Teacher',
      email: 'teacher@school.id',
      role: 'teacher',
    } as BaseUser,
  })),
}))

vi.mock('@/hooks/useTeacher', () => ({
  useTeacherDashboard: vi.fn(),
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

vi.mock('@/components/dashboard/DashboardStatCard', () => ({
  DashboardStatCard: ({
    title,
    value,
    subtitle,
  }: {
    title: string
    value: string
    subtitle?: string
  }) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      <span>{value}</span>
      {subtitle && <span>{subtitle}</span>}
    </div>
  ),
}))

vi.mock('@/components/dashboard/DashboardCardEmptyState', () => ({
  DashboardCardEmptyState: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
  ),
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

import { useTeacherDashboard } from '@/hooks/useTeacher'

describe('TeacherDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should render loading state', () => {
      vi.mocked(useTeacherDashboard).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<TeacherDashboardPage />, { wrapper })

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should render error state', () => {
      vi.mocked(useTeacherDashboard).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
      } as any)

      const wrapper = createWrapper()
      render(<TeacherDashboardPage />, { wrapper })

      expect(screen.getByTestId('error')).toBeInTheDocument()
    })
  })

  describe('Empty Data State', () => {
    it('should render no data state', () => {
      vi.mocked(useTeacherDashboard).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<TeacherDashboardPage />, { wrapper })

      expect(screen.getByTestId('no-data')).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('should render dashboard with data', () => {
      const mockData: TeacherDashboardData = {
        teacherId: 'teacher-01',
        name: 'Test Teacher',
        email: 'teacher@school.id',
        totalClasses: 5,
        totalStudents: 150,
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
            studentName: 'Budi',
          },
        ],
        recentAnnouncements: [
          {
            id: 'a-01',
            title: 'Test Announcement',
            content: 'Test content',
            authorId: 'admin-01',
            createdAt: '2026-01-07T10:00:00.000Z',
            updatedAt: '2026-01-07T10:00:00.000Z',
          },
        ],
      }

      vi.mocked(useTeacherDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<TeacherDashboardPage />, { wrapper })

      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /teacher dashboard/i })).toBeInTheDocument()
    })

    it('should render empty states when no data available', () => {
      const mockData: TeacherDashboardData = {
        teacherId: 'teacher-01',
        name: 'Test Teacher',
        email: 'teacher@school.id',
        totalClasses: 0,
        totalStudents: 0,
        recentGrades: [],
        recentAnnouncements: [],
      }

      vi.mocked(useTeacherDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<TeacherDashboardPage />, { wrapper })

      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
      expect(screen.getAllByTestId('empty-state')).toHaveLength(2)
    })

    it('should display teacher name in description', () => {
      const mockData: TeacherDashboardData = {
        teacherId: 'teacher-01',
        name: 'John Doe',
        email: 'john@school.id',
        totalClasses: 3,
        totalStudents: 90,
        recentGrades: [],
        recentAnnouncements: [],
      }

      vi.mocked(useTeacherDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<TeacherDashboardPage />, { wrapper })

      expect(screen.getByText(/welcome back, john doe/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper region roles', () => {
      const mockData: TeacherDashboardData = {
        teacherId: 'teacher-01',
        name: 'Test Teacher',
        email: 'teacher@school.id',
        totalClasses: 0,
        totalStudents: 0,
        recentGrades: [],
        recentAnnouncements: [],
      }

      vi.mocked(useTeacherDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<TeacherDashboardPage />, { wrapper })

      expect(
        screen.getByRole('region', { name: /teacher dashboard overview/i })
      ).toBeInTheDocument()
    })
  })
})
