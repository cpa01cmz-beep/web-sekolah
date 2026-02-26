import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { TeacherGradeManagementPage } from '../portal/teacher/TeacherGradeManagementPage'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'teacher-01', name: 'Test Teacher', email: 'teacher@school.id', role: 'teacher' },
  })),
}))

vi.mock('@/hooks/useTeacher', () => ({
  useTeacherClasses: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useTeacherClassStudents: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/lib/api-client', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  },
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
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

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="select-trigger">{children}</button>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

vi.mock('@/components/ui/loading-skeletons', () => ({
  TableSkeleton: () => <div data-testid="table-skeleton">Loading table...</div>,
}))

vi.mock('@/components/forms/GradeForm', () => ({
  GradeForm: ({ open }: any) => (open ? <div data-testid="grade-form">Grade Form</div> : null),
}))

vi.mock('@/components/ui/responsive-table', () => ({
  ResponsiveTable: ({ headers, rows }: { headers: any[]; rows: any[] }) => (
    <div data-testid="table">
      <div data-testid="headers">{headers.length}</div>
      <div data-testid="rows">{rows.length}</div>
    </div>
  ),
}))

vi.mock('@/components/tables/GradeActions', () => ({
  GradeActions: () => <div data-testid="grade-actions">Actions</div>,
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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

describe('TeacherGradeManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render page header', () => {
      const wrapper = createWrapper()
      render(<TeacherGradeManagementPage />, { wrapper })

      expect(screen.getByTestId('page-header')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /grade management/i })).toBeInTheDocument()
    })

    it('should render class selector', () => {
      const wrapper = createWrapper()
      render(<TeacherGradeManagementPage />, { wrapper })

      expect(screen.getByTestId('select')).toBeInTheDocument()
    })
  })
})
