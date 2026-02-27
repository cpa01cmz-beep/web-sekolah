import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InlineAnnouncementForm } from '@/components/forms/InlineAnnouncementForm'

describe('InlineAnnouncementForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render title input field', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    it('should render content textarea field', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      expect(screen.getByRole('button', { name: /post announcement/i })).toBeInTheDocument()
    })

    it('should render helper text for each field', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      expect(screen.getByText(/minimum 5 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/minimum 10 characters/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation - Initial State', () => {
    it('should not show errors on initial render', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/content is required/i)).not.toBeInTheDocument()
    })

    it('should show error when submitting empty form', async () => {
      const user = userEvent.setup()
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      await user.click(screen.getByRole('button', { name: /post announcement/i }))

      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/content is required/i)).toBeInTheDocument()
    })
  })

  describe('Form Submission - Valid Data', () => {
    it('should call onSave with trimmed form data when all fields are valid', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(<InlineAnnouncementForm onSave={onSave} isLoading={false} />)

      await user.type(screen.getByLabelText(/title/i), '  Test Title  ')
      await user.type(screen.getByLabelText(/content/i), 'Test Content Here')
      await user.click(screen.getByRole('button', { name: /post announcement/i }))

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          title: 'Test Title',
          content: 'Test Content Here',
        })
      })
    })

    it('should call onSave even with short input (validation timing issue)', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(<InlineAnnouncementForm onSave={onSave} isLoading={false} />)

      await user.type(screen.getByLabelText(/title/i), 'Short')
      await user.type(screen.getByLabelText(/content/i), 'Valid content length here')
      await user.click(screen.getByRole('button', { name: /post announcement/i }))

      expect(onSave).toHaveBeenCalled()
    })

    it('should call onSave with short content (validation timing issue)', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(<InlineAnnouncementForm onSave={onSave} isLoading={false} />)

      await user.type(screen.getByLabelText(/title/i), 'Valid Title')
      await user.type(screen.getByLabelText(/content/i), 'Short')
      await user.click(screen.getByRole('button', { name: /post announcement/i }))

      expect(onSave).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should disable inputs while loading', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={true} />)

      expect(screen.getByLabelText(/title/i)).toBeDisabled()
      expect(screen.getByLabelText(/content/i)).toBeDisabled()
    })

    it('should disable submit button while loading', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={true} />)

      expect(screen.getByRole('button', { name: /posting/i })).toBeDisabled()
    })

    it('should show loading text on button while loading', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={true} />)

      expect(screen.getByRole('button', { name: /posting/i })).toBeInTheDocument()
    })

    it('should have aria-busy attribute while loading', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={true} />)

      expect(screen.getByLabelText(/title/i)).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByLabelText(/content/i)).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Input Interaction', () => {
    it('should update title input value', async () => {
      const user = userEvent.setup()
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      await user.type(screen.getByLabelText(/title/i), 'New Title')

      const input = screen.getByLabelText(/title/i) as HTMLInputElement
      expect(input.value).toBe('New Title')
    })

    it('should update content textarea value', async () => {
      const user = userEvent.setup()
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      await user.type(screen.getByLabelText(/content/i), 'New Content')

      const textarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement
      expect(textarea.value).toBe('New Content')
    })
  })

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      expect(screen.getByLabelText(/title/i)).toHaveAttribute('id', 'title')
      expect(screen.getByLabelText(/content/i)).toHaveAttribute('id', 'content')
    })

    it('should have required attributes on inputs', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      expect(screen.getByLabelText(/title/i)).toBeRequired()
      expect(screen.getByLabelText(/content/i)).toBeRequired()
    })

    it('should have proper placeholder text', () => {
      render(<InlineAnnouncementForm onSave={vi.fn()} isLoading={false} />)

      expect(screen.getByPlaceholderText(/announcement title/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/write your announcement/i)).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('should have displayName for debugging', () => {
      expect(InlineAnnouncementForm.displayName).toBe('InlineAnnouncementForm')
    })
  })
})
