import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScheduleListItem } from '@/components/dashboard/ScheduleListItem'

describe('ScheduleListItem', () => {
  describe('Rendering with teacherName', () => {
    it('should render courseName and teacherName', () => {
      render(<ScheduleListItem courseName="Mathematics" time="08:00" teacherName="Mr. Smith" />)

      expect(screen.getByText('Mathematics')).toBeInTheDocument()
      expect(screen.getByText('Mr. Smith')).toBeInTheDocument()
      expect(screen.getByText('08:00')).toBeInTheDocument()
    })

    it('should render time in a separate column', () => {
      const { container } = render(
        <ScheduleListItem courseName="Physics" time="10:00" teacherName="Dr. Johnson" />
      )

      expect(container.querySelector('.w-24')).toBeInTheDocument()
    })

    it('should use flex layout for time and details', () => {
      const { container } = render(
        <ScheduleListItem courseName="Chemistry" time="14:00" teacherName="Ms. Williams" />
      )

      expect(container.querySelector('.flex.items-start')).toBeInTheDocument()
    })
  })

  describe('Rendering with day', () => {
    it('should render courseName with time and day', () => {
      render(<ScheduleListItem courseName="Biology" time="09:00" day="Senin" />)

      expect(screen.getByText('Biology')).toBeInTheDocument()
      expect(screen.getByText(/09:00 - Senin/)).toBeInTheDocument()
    })

    it('should render time only when day is not provided', () => {
      render(<ScheduleListItem courseName="History" time="11:00" />)

      expect(screen.getByText('History')).toBeInTheDocument()
      expect(screen.getByText('11:00')).toBeInTheDocument()
    })

    it('should use compact layout without teacherName', () => {
      const { container } = render(
        <ScheduleListItem courseName="Geography" time="13:00" day="Rabu" />
      )

      expect(container.querySelector('.flex.items-start')).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have text-sm class for compact variant', () => {
      const { container } = render(<ScheduleListItem courseName="English" time="15:00" />)

      expect(container.querySelector('.text-sm')).toBeInTheDocument()
    })

    it('should have font-medium class for courseName', () => {
      render(<ScheduleListItem courseName="Art" time="16:00" />)

      const courseElement = screen.getByText('Art')
      expect(courseElement).toHaveClass('font-medium')
    })

    it('should have text-muted-foreground for secondary text', () => {
      const { container } = render(<ScheduleListItem courseName="Music" time="17:00" day="Jumat" />)

      expect(container.querySelector('.text-muted-foreground')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render as list item', () => {
      const { container } = render(
        <ScheduleListItem courseName="Computer Science" time="08:00" teacherName="Prof. Lee" />
      )

      expect(container.querySelector('li')).toBeInTheDocument()
    })

    it('should be visible', () => {
      render(<ScheduleListItem courseName="Physical Education" time="09:00" />)

      expect(screen.getByText('Physical Education')).toBeVisible()
    })
  })

  describe('Memoization', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <ScheduleListItem courseName="Economics" time="10:00" teacherName="Dr. Brown" />
      )

      rerender(<ScheduleListItem courseName="Economics" time="10:00" teacherName="Dr. Brown" />)

      expect(screen.getByText('Economics')).toBeInTheDocument()
    })
  })
})
