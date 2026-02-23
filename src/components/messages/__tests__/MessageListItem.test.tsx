import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageListItem } from '@/components/messages/MessageListItem'
import type { Message } from '@shared/types'

const mockMessage: Message = {
  id: 'msg-1',
  senderId: 'user-1',
  senderRole: 'teacher',
  recipientId: 'user-2',
  recipientRole: 'parent',
  subject: 'Test Subject',
  content: 'Test content for the message',
  isRead: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('MessageListItem', () => {
  const defaultProps = {
    message: mockMessage,
    currentUserId: 'user-2',
    contactName: 'John Doe',
    contactLabel: 'To: ',
    variant: 'inbox' as const,
    onClick: vi.fn(),
  }

  describe('Rendering', () => {
    it('should render message subject', () => {
      render(<MessageListItem {...defaultProps} />)

      expect(screen.getByText('Test Subject')).toBeInTheDocument()
    })

    it('should render message content', () => {
      render(<MessageListItem {...defaultProps} />)

      expect(screen.getByText('Test content for the message')).toBeInTheDocument()
    })

    it('should render contact name', () => {
      render(<MessageListItem {...defaultProps} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should render User icon', () => {
      const { container } = render(<MessageListItem {...defaultProps} />)

      const icon = container.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Inbox Variant', () => {
    it('should show contact name without prefix in inbox', () => {
      render(<MessageListItem {...defaultProps} variant="inbox" />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('To: John Doe')).not.toBeInTheDocument()
    })

    it('should show New badge for unread inbox message', () => {
      render(<MessageListItem {...defaultProps} variant="inbox" />)

      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should not show New badge for read inbox message', () => {
      render(
        <MessageListItem
          {...defaultProps}
          message={{ ...mockMessage, isRead: true }}
          variant="inbox"
        />
      )

      expect(screen.queryByText('New')).not.toBeInTheDocument()
    })

    it('should have unread styling for unread inbox message', () => {
      const { container } = render(<MessageListItem {...defaultProps} variant="inbox" />)

      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-primary/5')
    })

    it('should have regular styling for read inbox message', () => {
      const { container } = render(
        <MessageListItem
          {...defaultProps}
          message={{ ...mockMessage, isRead: true }}
          variant="inbox"
        />
      )

      const button = container.querySelector('button')
      expect(button).not.toHaveClass('bg-primary/5')
    })
  })

  describe('Sent Variant', () => {
    it('should show contact name with label prefix in sent', () => {
      render(<MessageListItem {...defaultProps} variant="sent" />)

      expect(screen.getByText('To: John Doe')).toBeInTheDocument()
    })

    it('should not show New badge in sent variant', () => {
      render(
        <MessageListItem
          {...defaultProps}
          message={{ ...mockMessage, isRead: false }}
          variant="sent"
        />
      )

      expect(screen.queryByText('New')).not.toBeInTheDocument()
    })

    it('should have regular styling in sent variant', () => {
      const { container } = render(<MessageListItem {...defaultProps} variant="sent" />)

      const button = container.querySelector('button')
      expect(button).toHaveClass('hover:bg-muted')
      expect(button).not.toHaveClass('bg-primary/5')
    })
  })

  describe('Click Interaction', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn()
      render(<MessageListItem {...defaultProps} onClick={onClick} />)

      fireEvent.click(screen.getByText('Test Subject'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Truncation', () => {
    it('should have truncate class on subject', () => {
      const { container } = render(<MessageListItem {...defaultProps} />)

      const subject = container.querySelector('.truncate')
      expect(subject).toHaveTextContent('Test Subject')
    })

    it('should have truncate class on content', () => {
      const { container } = render(<MessageListItem {...defaultProps} />)

      const truncates = container.querySelectorAll('.truncate')
      expect(truncates.length).toBe(2)
    })
  })

  describe('Memoization', () => {
    it('should have displayName for React DevTools', () => {
      expect(MessageListItem.displayName).toBe('MessageListItem')
    })

    it('should be memoized', () => {
      const { rerender } = render(<MessageListItem {...defaultProps} />)

      rerender(<MessageListItem {...defaultProps} />)

      expect(screen.getByText('Test Subject')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty subject', () => {
      render(<MessageListItem {...defaultProps} message={{ ...mockMessage, subject: '' }} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle empty content', () => {
      render(<MessageListItem {...defaultProps} message={{ ...mockMessage, content: '' }} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle very long subject', () => {
      const longSubject = 'This is a very long subject that should be truncated when displayed'
      render(
        <MessageListItem {...defaultProps} message={{ ...mockMessage, subject: longSubject }} />
      )

      expect(screen.getByText(longSubject)).toBeInTheDocument()
    })

    it('should handle very long content', () => {
      const longContent =
        'This is a very long content that should be truncated when displayed in the message list item component'
      render(
        <MessageListItem {...defaultProps} message={{ ...mockMessage, content: longContent }} />
      )

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })

  describe('Contact Label', () => {
    it('should support custom contact label', () => {
      render(<MessageListItem {...defaultProps} contactLabel="From: " variant="inbox" />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should apply contact label in sent variant', () => {
      render(<MessageListItem {...defaultProps} contactLabel="To: " variant="sent" />)

      expect(screen.getByText('To: John Doe')).toBeInTheDocument()
    })

    it('should handle empty contact label', () => {
      render(<MessageListItem {...defaultProps} contactLabel="" variant="sent" />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be a button element', () => {
      render(<MessageListItem {...defaultProps} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should have aria-hidden on icon', () => {
      const { container } = render(<MessageListItem {...defaultProps} />)

      const icon = container.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })
  })
})
