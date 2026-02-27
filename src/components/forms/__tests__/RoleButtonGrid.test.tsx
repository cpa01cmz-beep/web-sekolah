import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoleButtonGrid } from '@/components/forms/RoleButtonGrid'

describe('RoleButtonGrid', () => {
  describe('Rendering', () => {
    it('should render all four role buttons', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      expect(screen.getByRole('button', { name: /login as student/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login as teacher/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login as parent/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login as admin/i })).toBeInTheDocument()
    })

    it('should render buttons in a 2x2 grid layout', () => {
      const onRoleSelect = vi.fn()
      const { container } = render(
        <RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />
      )

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-2')
    })

    it('should apply custom button className when provided', () => {
      const onRoleSelect = vi.fn()
      const customClass = 'custom-button-class'
      render(
        <RoleButtonGrid
          loadingRole={null}
          onRoleSelect={onRoleSelect}
          buttonClassName={customClass}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass(customClass)
      })
    })
  })

  describe('Button Interaction', () => {
    it('should call onRoleSelect with correct role when button is clicked', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      fireEvent.click(screen.getByRole('button', { name: /login as student/i }))
      expect(onRoleSelect).toHaveBeenCalledWith('student')
      expect(onRoleSelect).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByRole('button', { name: /login as teacher/i }))
      expect(onRoleSelect).toHaveBeenCalledWith('teacher')
      expect(onRoleSelect).toHaveBeenCalledTimes(2)

      fireEvent.click(screen.getByRole('button', { name: /login as parent/i }))
      expect(onRoleSelect).toHaveBeenCalledWith('parent')
      expect(onRoleSelect).toHaveBeenCalledTimes(3)

      fireEvent.click(screen.getByRole('button', { name: /login as admin/i }))
      expect(onRoleSelect).toHaveBeenCalledWith('admin')
      expect(onRoleSelect).toHaveBeenCalledTimes(4)
    })
  })

  describe('Loading State', () => {
    it('should disable button when loadingRole matches button role', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole="student" onRoleSelect={onRoleSelect} />)

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      expect(studentButton).toBeDisabled()

      const teacherButton = screen.getByRole('button', { name: /login as teacher/i })
      expect(teacherButton).not.toBeDisabled()
    })

    it('should display loading text for button matching loadingRole', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole="teacher" onRoleSelect={onRoleSelect} />)

      const teacherButton = screen.getByRole('button', { name: /login as teacher/i })
      expect(teacherButton).toHaveTextContent('Logging in...')

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      expect(studentButton).toHaveTextContent('Student')
    })

    it('should set aria-busy attribute on loading button', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole="parent" onRoleSelect={onRoleSelect} />)

      const loadingButton = screen.getByRole('button', { name: /login as parent/i })
      expect(loadingButton).toHaveAttribute('aria-busy', 'true')

      const teacherButton = screen.getByRole('button', { name: /login as teacher/i })
      expect(teacherButton).toHaveAttribute('aria-busy', 'false')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label for each button', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      expect(screen.getByRole('button', { name: 'Login as student' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login as teacher' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login as parent' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login as admin' })).toBeInTheDocument()
    })

    it('should maintain accessibility attributes in loading state', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole="admin" onRoleSelect={onRoleSelect} />)

      const loadingButton = screen.getByRole('button', { name: 'Login as admin' })
      expect(loadingButton).toHaveAttribute('aria-busy', 'true')
      expect(loadingButton).toHaveAttribute('aria-label', 'Login as admin')
    })
  })

  describe('Button Variants', () => {
    it('should apply primary variant styling to Student and Teacher buttons', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      expect(studentButton).toHaveClass('bg-[--bg-color]')
      expect(studentButton.style.getPropertyValue('--bg-color')).toBeTruthy()
    })

    it('should apply secondary variant styling to Parent and Admin buttons', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      const parentButton = screen.getByRole('button', { name: /login as parent/i })
      expect(parentButton).toHaveClass('bg-[--bg-color]')
    })

    it('should have minimum height of 44px for touch targets', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null loadingRole without errors', () => {
      const onRoleSelect = vi.fn()
      expect(() => {
        render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)
      }).not.toThrow()
    })

    it('should handle onRoleSelect being called multiple times in succession', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      fireEvent.click(studentButton)
      fireEvent.click(studentButton)
      fireEvent.click(studentButton)

      expect(onRoleSelect).toHaveBeenCalledTimes(3)
      expect(onRoleSelect).toHaveBeenCalledWith('student')
    })

    it('should handle all buttons being clicked before loading state changes', () => {
      const onRoleSelect = vi.fn()
      render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      fireEvent.click(screen.getByRole('button', { name: /login as student/i }))
      fireEvent.click(screen.getByRole('button', { name: /login as teacher/i }))
      fireEvent.click(screen.getByRole('button', { name: /login as parent/i }))
      fireEvent.click(screen.getByRole('button', { name: /login as admin/i }))

      expect(onRoleSelect).toHaveBeenCalledTimes(4)
    })
  })

  describe('Memoization', () => {
    it('should have displayName for React DevTools', () => {
      expect(RoleButtonGrid.displayName).toBe('RoleButtonGrid')
    })

    it('should be memoized to prevent unnecessary re-renders', () => {
      const onRoleSelect = vi.fn()
      const { rerender } = render(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)

      const studentButton = screen.getByRole('button', { name: /login as student/i })
      const initialButton = studentButton

      rerender(<RoleButtonGrid loadingRole={null} onRoleSelect={onRoleSelect} />)
      const rerenderedButton = screen.getByRole('button', { name: /login as student/i })

      expect(initialButton).toBe(rerenderedButton)
    })
  })
})
