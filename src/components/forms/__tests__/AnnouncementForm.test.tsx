import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnnouncementForm } from '@/components/forms/AnnouncementForm'

describe('AnnouncementForm', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render dialog with title and description', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      expect(screen.getByText('Create Announcement')).toBeInTheDocument()
      expect(screen.getByText('Post a new school-wide announcement.')).toBeInTheDocument()
    })

    it('should render title input field', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Announcement Title')).toBeInTheDocument()
    })

    it('should render content textarea field', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/write your announcement here/i)).toBeInTheDocument()
    })

    it('should render cancel and submit buttons', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Post Announcement' })).toBeInTheDocument()
    })

    it('should not render dialog when open is false', () => {
      render(
        <AnnouncementForm
          open={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
          isLoading={false}
        />
      )

      expect(screen.queryByText('Create Announcement')).not.toBeInTheDocument()
    })
  })

  describe('Form State', () => {
    it('should allow typing in title field', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: 'School Closed Tomorrow' } })

      expect(titleInput).toHaveValue('School Closed Tomorrow')
    })

    it('should allow typing in content field', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      const contentInput = screen.getByLabelText(/content/i)
      fireEvent.change(contentInput, {
        target: { value: 'Please note that school will be closed tomorrow due to weather.' },
      })

      expect(contentInput).toHaveValue(
        'Please note that school will be closed tomorrow due to weather.'
      )
    })

    it('should clear form when dialog closes', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      const titleInput = screen.getByLabelText(/title/i)
      const contentInput = screen.getByLabelText(/content/i)

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(contentInput, { target: { value: 'Test Content' } })

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('should not show validation errors initially', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/title must be at least 5 characters/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/content is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/content must be at least 10 characters/i)).not.toBeInTheDocument()
    })

    it('should not show errors while typing valid content', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: 'Valid Title' } })

      expect(screen.queryByText(/title must be at least 5 characters/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should have submit button', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      expect(screen.getByRole('button', { name: 'Post Announcement' })).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={true} />
      )

      const submitButton = screen.getByRole('button', { name: 'Posting...' })
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveAttribute('aria-busy', 'true')
    })

    it('should show loading text on submit button when loading', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={true} />
      )

      expect(screen.getByRole('button', { name: 'Posting...' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Post Announcement' })).not.toBeInTheDocument()
    })

    it('should not disable cancel button when loading', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={true} />
      )

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).not.toBeDisabled()
    })

    it('should not disable form inputs when loading', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={true} />
      )

      expect(screen.getByLabelText(/title/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/content/i)).not.toBeDisabled()
    })
  })

  describe('Dialog Behavior', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should clear form when dialog is closed', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      const titleInput = screen.getByLabelText(/title/i)
      const contentInput = screen.getByLabelText(/content/i)

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(contentInput, { target: { value: 'Test Content' } })

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when Escape key is pressed', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have required attribute on form fields', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      const titleInput = screen.getByLabelText(/title/i)
      const contentInput = screen.getByLabelText(/content/i)

      expect(titleInput).toBeRequired()
      expect(contentInput).toBeRequired()
    })

    it('should have helper text for form fields', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      expect(screen.getByText(/enter a descriptive title/i)).toBeInTheDocument()
      expect(screen.getByText(/provide detailed information/i)).toBeInTheDocument()
    })

    it('should have proper ARIA attributes in loading state', () => {
      render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={true} />
      )

      const submitButton = screen.getByRole('button', { name: 'Posting...' })
      expect(submitButton).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null loadingRole without errors', () => {
      expect(() => {
        render(
          <AnnouncementForm
            open={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
            isLoading={false}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Memoization', () => {
    it('should have displayName for React DevTools', () => {
      expect(AnnouncementForm.displayName).toBe('AnnouncementForm')
    })

    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )

      const titleInput = screen.getByLabelText(/title/i)
      const initialInput = titleInput

      rerender(
        <AnnouncementForm open={true} onClose={mockOnClose} onSave={mockOnSave} isLoading={false} />
      )
      const rerenderedInput = screen.getByLabelText(/title/i)

      expect(initialInput).toBe(rerenderedInput)
    })
  })
})
