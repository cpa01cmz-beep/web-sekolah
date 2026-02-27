import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserForm } from '@/components/forms/UserForm'
import { SchoolUser } from '@shared/types'

describe('UserForm', () => {
  describe('Rendering - Add Mode', () => {
    it('should render dialog with "Add New User" title when editingUser is null', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByText('Add New User')).toBeInTheDocument()
      expect(screen.getByText('Fill in the details to create a new user.')).toBeInTheDocument()
    })

    it('should render name input field', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    it('should render email input field', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('should render role select field', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    })

    it('should render cancel and submit buttons', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('should not render dialog when open is false', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={false}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.queryByText('Add New User')).not.toBeInTheDocument()
    })
  })

  describe('Rendering - Edit Mode', () => {
    it('should render dialog with "Edit User" title when editingUser is provided', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      const editingUser: SchoolUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'teacher',
        avatarUrl: 'https://example.com/avatar.jpg',
        classIds: ['class1', 'class2'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={editingUser}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByText('Edit User')).toBeInTheDocument()
      expect(screen.getByText('Update details for this user.')).toBeInTheDocument()
    })

    it('should pre-populate form with editingUser data', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      const editingUser: SchoolUser = {
        id: '1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={editingUser}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByLabelText(/name/i)).toHaveValue('Jane Smith')
      expect(screen.getByLabelText(/email/i)).toHaveValue('jane@example.com')
    })
  })

  describe('Form State', () => {
    it('should allow typing in name field', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const nameInput = screen.getByLabelText(/name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'John Doe')

      expect(nameInput).toHaveValue('John Doe')
    })

    it('should allow typing in email field', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const emailInput = screen.getByLabelText(/email/i)
      await user.clear(emailInput)
      await user.type(emailInput, 'john@example.com')

      expect(emailInput).toHaveValue('john@example.com')
    })

    it('should pre-populate form when opened in edit mode', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      const editingUser: SchoolUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'parent',
        avatarUrl: 'https://example.com/avatar.jpg',
        childId: 'child123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={editingUser}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByLabelText(/name/i)).toHaveValue('Test User')
      expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com')
    })
  })

  describe('Form Submission', () => {
    it('should call onSave with user data when form is submitted with valid data', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)

      await user.clear(nameInput)
      await user.type(nameInput, 'John Doe')
      await user.clear(emailInput)
      await user.type(emailInput, 'john@example.com')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSave).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
      })
    })

    it('should trim name and email when saving', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)

      await user.clear(nameInput)
      await user.type(nameInput, '  John Doe  ')
      await user.clear(emailInput)
      await user.type(emailInput, '  john@example.com  ')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSave).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
      })
    })

    it('should save with student role by default', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)

      await user.clear(nameInput)
      await user.type(nameInput, 'John Doe')
      await user.clear(emailInput)
      await user.type(emailInput, 'john@example.com')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ role: 'student' }))
    })

    it('should not call onSave when form has validation errors', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      // onSave should not be called with empty required fields
      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={true}
        />
      )

      const submitButton = screen.getByRole('button', { name: /saving/i })
      expect(submitButton).toBeDisabled()
    })

    it('should show loading text on submit button when loading', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={true}
        />
      )

      expect(screen.getByRole('button', { name: /saving\.\.\./i })).toBeInTheDocument()
    })

    it('should set aria-busy on submit button when loading', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={true}
        />
      )

      const submitButton = screen.getByRole('button', { name: /saving\.\.\./i })
      expect(submitButton).toHaveAttribute('aria-busy', 'true')
    })

    it('should not disable cancel button when loading', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={true}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).not.toBeDisabled()
    })

    it('should show "Save changes" text when not loading', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })
  })

  describe('Dialog Behavior', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when Escape key is pressed', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have required attribute on name input', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toHaveAttribute('required')
    })

    it('should have required attribute on email input', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('required')
    })

    it('should have type="email" on email input', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have helper text for form fields', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByText(/full name of user/i)).toBeInTheDocument()
      expect(screen.getByText(/valid email address for account access/i)).toBeInTheDocument()
      expect(
        screen.getByText(/user role determines system access and permissions/i)
      ).toBeInTheDocument()
    })

    it('should have aria-busy on submit button during loading', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={true}
        />
      )

      const submitButton = screen.getByRole('button', { name: /saving\.\.\./i })
      expect(submitButton).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('should handle name with multiple spaces', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)

      await user.clear(nameInput)
      await user.type(nameInput, 'John   Doe   Jr.')
      await user.clear(emailInput)
      await user.type(emailInput, 'john@example.com')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'John   Doe   Jr.' }))
    })

    it('should handle email with subdomain', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)

      await user.clear(nameInput)
      await user.type(nameInput, 'John Doe')
      await user.clear(emailInput)
      await user.type(emailInput, 'john@mail.example.com')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'john@mail.example.com' })
      )
    })

    it('should handle editingUser with different roles', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()

      const studentUser: SchoolUser = {
        id: '1',
        name: 'Student User',
        email: 'student@example.com',
        role: 'student',
        avatarUrl: 'https://example.com/avatar.jpg',
        classId: 'class1',
        studentIdNumber: '12345',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const teacherUser: SchoolUser = {
        id: '2',
        name: 'Teacher User',
        email: 'teacher@example.com',
        role: 'teacher',
        avatarUrl: 'https://example.com/avatar.jpg',
        classIds: ['class1', 'class2'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const parentUser: SchoolUser = {
        id: '3',
        name: 'Parent User',
        email: 'parent@example.com',
        role: 'parent',
        avatarUrl: 'https://example.com/avatar.jpg',
        childId: 'child123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const adminUser: SchoolUser = {
        id: '4',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      ;[studentUser, teacherUser, parentUser, adminUser].forEach(user => {
        const { unmount } = render(
          <UserForm
            open={true}
            onClose={onClose}
            editingUser={user}
            onSave={onSave}
            isLoading={false}
          />
        )

        expect(screen.getByLabelText(/name/i)).toHaveValue(user.name)
        expect(screen.getByLabelText(/email/i)).toHaveValue(user.email)
        unmount()
      })
    })

    it('should handle multiple submission attempts with invalid data', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      await user.click(screen.getByRole('button', { name: /save changes/i }))
      await user.click(screen.getByRole('button', { name: /save changes/i }))
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('Helper Text', () => {
    it('should show name helper text', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByText('Full name of user')).toBeInTheDocument()
    })

    it('should show email helper text', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(screen.getByText('Valid email address for account access')).toBeInTheDocument()
    })

    it('should show role helper text', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      expect(
        screen.getByText('User role determines system access and permissions')
      ).toBeInTheDocument()
    })

    it('should show placeholder text in email field', () => {
      const onClose = vi.fn()
      const onSave = vi.fn()
      render(
        <UserForm
          open={true}
          onClose={onClose}
          editingUser={null}
          onSave={onSave}
          isLoading={false}
        />
      )

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('placeholder', 'user@example.com')
    })
  })
})
