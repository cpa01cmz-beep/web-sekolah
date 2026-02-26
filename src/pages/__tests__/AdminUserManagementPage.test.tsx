import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AdminUserManagementPage } from '../portal/admin/AdminUserManagementPage'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'admin-01', name: 'Test Admin', email: 'admin@school.id', role: 'admin' },
  })),
}))

vi.mock('@/hooks/useAdmin', () => ({
  useUsers: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useCreateUser: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUpdateUser: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useDeleteUser: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

vi.mock('@/lib/api-client', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  },
}))

vi.mock('@/constants/avatars', () => ({
  getAvatarUrl: vi.fn(() => 'https://example.com/avatar.png'),
}))

vi.mock('@/components/PageHeader', () => ({
  PageHeader: ({
    title,
    description,
    children,
  }: {
    title: string
    description?: string
    children?: React.ReactNode
  }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
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
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/dialog', () => ({
  DialogTrigger: ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
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
  TableSkeleton: () => <div data-testid="table-skeleton">Loading table...</div>,
}))

vi.mock('@/components/forms/UserForm', () => ({
  UserForm: ({ open }: any) => (open ? <div data-testid="user-form">User Form</div> : null),
}))

vi.mock('@/components/ui/responsive-table', () => ({
  ResponsiveTable: ({ headers, rows }: { headers: any[]; rows: any[] }) => (
    <div data-testid="table">
      <div data-testid="headers">{headers.length}</div>
      <div data-testid="rows">{rows.length}</div>
    </div>
  ),
}))

vi.mock('@/components/tables/UserActions', () => ({
  UserActions: () => <div data-testid="user-actions">Actions</div>,
}))

vi.mock('@/components/tables/UserRoleBadge', () => ({
  UserRoleBadge: () => <span data-testid="role-badge">Role</span>,
}))

vi.mock('lucide-react', () => ({
  PlusCircle: () => <span data-testid="plus-circle">PlusCircle</span>,
  AlertTriangle: () => <span data-testid="alert-triangle">AlertTriangle</span>,
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

describe('AdminUserManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render page header', () => {
      const wrapper = createWrapper()
      render(<AdminUserManagementPage />, { wrapper })

      expect(screen.getByTestId('page-header')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /user management/i })).toBeInTheDocument()
    })

    it('should render add user button', () => {
      const wrapper = createWrapper()
      render(<AdminUserManagementPage />, { wrapper })

      expect(screen.getByTestId('button')).toBeInTheDocument()
      expect(screen.getByText(/add user/i)).toBeInTheDocument()
    })

    it('should render empty state when no users', () => {
      const wrapper = createWrapper()
      render(<AdminUserManagementPage />, { wrapper })

      expect(screen.getByText(/no users found/i)).toBeInTheDocument()
    })
  })
})
