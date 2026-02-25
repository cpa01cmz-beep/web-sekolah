import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AdminDashboardPage } from '../portal/admin/AdminDashboardPage'
import type { AdminDashboardData } from '@shared/types'

vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

vi.mock('@/hooks/useAdmin', () => ({
  useAdminDashboard: vi.fn(),
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

vi.mock('../portal/admin/AdminDashboardContent', () => ({
  AdminDashboardContent: ({
    data,
  }: {
    data: AdminDashboardData
    prefersReducedMotion: boolean
  }) => (
    <div data-testid="admin-dashboard-content">
      <h1>Admin Dashboard</h1>
      <p>Total Users: {data.totalUsers}</p>
    </div>
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

import { useAdminDashboard } from '@/hooks/useAdmin'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should render loading state', () => {
      vi.mocked(useAdminDashboard).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<AdminDashboardPage />, { wrapper })

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should render error state', () => {
      vi.mocked(useAdminDashboard).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
      } as any)

      const wrapper = createWrapper()
      render(<AdminDashboardPage />, { wrapper })

      expect(screen.getByTestId('error')).toBeInTheDocument()
    })
  })

  describe('Empty Data State', () => {
    it('should render no data state', () => {
      vi.mocked(useAdminDashboard).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<AdminDashboardPage />, { wrapper })

      expect(screen.getByTestId('no-data')).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('should render dashboard with data', () => {
      const mockData: AdminDashboardData = {
        totalUsers: 500,
        totalStudents: 300,
        totalTeachers: 50,
        totalParents: 150,
        totalClasses: 20,
        recentAnnouncements: [
          {
            id: 'a-01',
            title: 'School Event',
            content: 'Event content',
            authorId: 'admin-01',
            createdAt: '2026-01-07T10:00:00.000Z',
            updatedAt: '2026-01-07T10:00:00.000Z',
          },
        ],
        userDistribution: {
          students: 300,
          teachers: 50,
          parents: 150,
          admins: 5,
        },
      }

      vi.mocked(useAdminDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<AdminDashboardPage />, { wrapper })

      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
      expect(screen.getByTestId('admin-dashboard-content')).toBeInTheDocument()
    })

    it('should pass prefersReducedMotion to content', () => {
      vi.mocked(useReducedMotion).mockReturnValueOnce(true)

      const mockData: AdminDashboardData = {
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalParents: 0,
        totalClasses: 0,
        recentAnnouncements: [],
        userDistribution: {
          students: 0,
          teachers: 0,
          parents: 0,
          admins: 0,
        },
      }

      vi.mocked(useAdminDashboard).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any)

      const wrapper = createWrapper()
      render(<AdminDashboardPage />, { wrapper })

      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    })
  })
})
