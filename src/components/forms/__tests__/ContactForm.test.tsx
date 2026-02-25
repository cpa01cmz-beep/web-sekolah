import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/forms/ContactForm'

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<ContactForm />)

      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })

    it('should render helper text for each field', () => {
      render(<ContactForm />)

      expect(screen.getByText(/enter your full name/i)).toBeInTheDocument()
      expect(screen.getByText(/we'll never share your email/i)).toBeInTheDocument()
      expect(screen.getByText(/how can we help you/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation - Initial State', () => {
    it('should not show errors on initial render', () => {
      render(<ContactForm />)

      expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/message is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Login Flow - Successful Submit', () => {
    it('should call onSubmit with form data when all fields are valid', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'This is a test message',
        })
      })
    })

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
      })
    })

    it('should reset form fields after successful submission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.queryByText(/full name/i)).not.toBeInTheDocument()
      })
    })

    it('should call onSubmit with onSubmit prop provided', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })
    })

    it('should call onSubmit even without onSubmit prop (no error)', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe('Login Flow - Failed Submit', () => {
    it('should not show success message when onSubmit throws', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'))
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.queryByText(/message sent successfully/i)).not.toBeInTheDocument()
      })
    })

    it('should still have form values after failed submission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'))
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
        expect(nameInput.value).toBe('John Doe')
      })
    })
  })

  describe('Login Flow - Loading State', () => {
    it('should disable inputs while submitting', async () => {
      const user = userEvent.setup()
      const onSubmit = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      expect(screen.getByLabelText(/full name/i)).toBeDisabled()
      expect(screen.getByLabelText(/email/i)).toBeDisabled()
      expect(screen.getByLabelText(/message/i)).toBeDisabled()
    })

    it('should show loading text on button while submitting', async () => {
      const user = userEvent.setup()
      const onSubmit = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument()
    })

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup()
      const onSubmit = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('id', 'contact-name')
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('id', 'contact-email')
      expect(screen.getByLabelText(/message/i)).toHaveAttribute('id', 'contact-message')
    })

    it('should have required attributes on inputs', () => {
      render(<ContactForm />)

      expect(screen.getByLabelText(/full name/i)).toBeRequired()
      expect(screen.getByLabelText(/email/i)).toBeRequired()
      expect(screen.getByLabelText(/message/i)).toBeRequired()
    })

    it('should have aria-busy on form while submitting', async () => {
      const user = userEvent.setup()
      const onSubmit = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Input Interaction', () => {
    it('should update name input value', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')

      const input = screen.getByLabelText(/full name/i) as HTMLInputElement
      expect(input.value).toBe('John Doe')
    })

    it('should update email input value', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.type(screen.getByLabelText(/email/i), 'john@example.com')

      const input = screen.getByLabelText(/email/i) as HTMLInputElement
      expect(input.value).toBe('john@example.com')
    })

    it('should update message textarea value', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.type(screen.getByLabelText(/message/i), 'Test message')

      const textarea = screen.getByLabelText(/message/i) as HTMLTextAreaElement
      expect(textarea.value).toBe('Test message')
    })
  })

  describe('Success State', () => {
    it('should show send another message button after success', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send another message/i })).toBeInTheDocument()
      })
    })

    it('should reset form when clicking send another message', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send another message/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /send another message/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        expect(screen.queryByText(/message sent successfully/i)).not.toBeInTheDocument()
      })
    })
  })
})
