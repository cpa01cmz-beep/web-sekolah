import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { useAuthStore } from '@/lib/authStore'
import { toast } from 'sonner'

vi.mock('@/lib/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn().mockResolvedValue({}),
  })),
}))

vi.mock('sonner', () => ({
  Toaster: vi.fn(() => null),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render login page with all required elements', () => {
      renderWithRouter(<LoginPage />)

      expect(screen.getByText('Akademia Pro')).toBeInTheDocument()
      expect(screen.getByText('Unified Login')).toBeInTheDocument()
      expect(screen.getByText('Enter your credentials to access your portal.')).toBeInTheDocument()
    })

    it('should render email input field', () => {
      renderWithRouter(<LoginPage />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument()
    })

    it('should render password input field', () => {
      renderWithRouter(<LoginPage />)

      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('•••••')).toBeInTheDocument()
    })

    it('should render all role selection buttons', () => {
      renderWithRouter(<LoginPage />)

      expect(screen.getByRole('button', { name: /login as student/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login as teacher/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login as parent/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login as admin/i })).toBeInTheDocument()
    })

    it('should render back to home link', () => {
      renderWithRouter(<LoginPage />)

      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()
    })

    it('should render helper text for inputs', () => {
      renderWithRouter(<LoginPage />)

      expect(screen.getByText('Enter your registered email address')).toBeInTheDocument()
      expect(screen.getByText('Enter your password')).toBeInTheDocument()
      expect(screen.getByText('Select your role to login:')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should not show validation errors initially', () => {
      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).not.toHaveAttribute('aria-invalid')
      expect(passwordInput).not.toHaveAttribute('aria-invalid')
    })

    it('should show validation error when submitting without email', async () => {
      const mockLogin = vi.fn().mockResolvedValue({})
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const passwordInput = screen.getByLabelText(/password/i)
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      fireEvent.click(studentButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
    })

    it('should show validation error when submitting without password', async () => {
      const mockLogin = vi.fn().mockResolvedValue({})
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      fireEvent.click(studentButton)

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid email format', async () => {
      const mockLogin = vi.fn().mockResolvedValue({})
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

      const passwordInput = screen.getByLabelText(/password/i)
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      fireEvent.click(studentButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for short password', async () => {
      const mockLogin = vi.fn().mockResolvedValue({})
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const passwordInput = screen.getByLabelText(/password/i)
      fireEvent.change(passwordInput, { target: { value: 'short' } })

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      fireEvent.click(studentButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Login Flow', () => {
    it('should call login with correct credentials when role is selected', async () => {
      const mockLogin = vi.fn().mockResolvedValue({})
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      fireEvent.change(emailInput, { target: { value: 'student@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      fireEvent.click(studentButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('student@example.com', 'password123', 'student')
      })
    })

    it('should show success toast on successful login', async () => {
      const mockLogin = vi.fn().mockResolvedValue({})
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      fireEvent.change(emailInput, { target: { value: 'teacher@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const teacherButton = screen.getByRole('button', { name: /login as teacher/i })
      fireEvent.click(teacherButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Logged in as teacher. Redirecting...')
      })
    })

    it('should show error toast on failed login', async () => {
      const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

      const adminButton = screen.getByRole('button', { name: /login as admin/i })
      fireEvent.click(adminButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login failed. Please check your credentials.')
      })
    })

    it('should disable the clicked role button while loading', () => {
      let resolveLogin: (value: unknown) => void
      const mockLogin = vi.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            resolveLogin = resolve
          })
      )
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      fireEvent.change(emailInput, { target: { value: 'parent@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const parentButton = screen.getByRole('button', { name: /login as parent/i })
      fireEvent.click(parentButton)

      expect(parentButton).toBeDisabled()
      expect(screen.getByRole('button', { name: /login as student/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /login as teacher/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /login as admin/i })).not.toBeDisabled()

      resolveLogin!({})
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithRouter(<LoginPage />)

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('id')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('id')
    })

    it('should have required attributes on input fields', () => {
      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('should have aria-describedby for helper text', () => {
      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('aria-describedby')
      expect(passwordInput).toHaveAttribute('aria-describedby')
    })
  })

  describe('Input Interaction', () => {
    it('should update email value on change', () => {
      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } })

      expect(emailInput).toHaveValue('newemail@example.com')
    })

    it('should update password value on change', () => {
      renderWithRouter(<LoginPage />)

      const passwordInput = screen.getByLabelText(/password/i)
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } })

      expect(passwordInput).toHaveValue('newpassword')
    })

    it('should disable inputs while loading', () => {
      const mockLogin = vi.fn().mockImplementation(() => new Promise(() => {}))
      vi.mocked(useAuthStore).mockReturnValue({ login: mockLogin } as ReturnType<
        typeof useAuthStore
      >)

      renderWithRouter(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      fireEvent.click(studentButton)

      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })
  })

  describe('Navigation', () => {
    it('should have link to home page', () => {
      renderWithRouter(<LoginPage />)

      const homeLink = screen.getByRole('link', { name: /back to home/i })
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should have logo link to home page', () => {
      renderWithRouter(<LoginPage />)

      const logoLink = screen.getByRole('link', { name: /akademia pro/i })
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })
})
