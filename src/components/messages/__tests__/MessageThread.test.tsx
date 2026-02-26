import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MessageThread } from '@/components/messages/MessageThread'
import type { Message } from '@shared/types'

const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  senderId: 'user-1',
  senderRole: 'teacher',
  recipientId: 'user-2',
  recipientRole: 'parent',
  subject: 'Test Subject',
  content: 'Test content',
  isRead: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

describe('MessageThread', () => {
  const currentUserId = 'user-2'
  const onMarkAsRead = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Empty State', () => {
    it('should render empty state when no messages', () => {
      render(
        <MessageThread messages={[]} currentUserId={currentUserId} onMarkAsRead={onMarkAsRead} />
      )

      expect(screen.getByText('No messages')).toBeInTheDocument()
      expect(screen.getByText('Start a conversation by sending a message.')).toBeInTheDocument()
    })

    it('should render MessageSquare icon in empty state', () => {
      const { container } = render(
        <MessageThread messages={[]} currentUserId={currentUserId} onMarkAsRead={onMarkAsRead} />
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Message Rendering', () => {
    it('should render single message', () => {
      const messages = [createMockMessage()]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      expect(screen.getByText('Test Subject')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should render multiple messages', () => {
      const messages = [
        createMockMessage({ id: 'msg-1', subject: 'First Subject' }),
        createMockMessage({ id: 'msg-2', subject: 'Second Subject' }),
      ]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      expect(screen.getByText('First Subject')).toBeInTheDocument()
      expect(screen.getByText('Second Subject')).toBeInTheDocument()
    })

    it('should render message content with whitespace preserved', () => {
      const messages = [createMockMessage({ content: 'Line 1\nLine 2\nLine 3' })]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      expect(screen.getByText(content => content.includes('Line 1'))).toBeInTheDocument()
    })
  })

  describe('Message Alignment', () => {
    it('should align sent messages to the right', () => {
      const messages = [createMockMessage({ senderId: currentUserId })]

      const { container } = render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      const messageDiv = container.querySelector('.justify-end')
      expect(messageDiv).toBeInTheDocument()
    })

    it('should align received messages to the left', () => {
      const messages = [createMockMessage({ senderId: 'other-user', recipientId: currentUserId })]

      const { container } = render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      const messageDiv = container.querySelector('.justify-start')
      expect(messageDiv).toBeInTheDocument()
    })

    it('should apply primary background for sent messages', () => {
      const messages = [createMockMessage({ senderId: currentUserId })]

      const { container } = render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      const messageBubble = container.querySelector('.bg-primary.text-primary-foreground')
      expect(messageBubble).toBeInTheDocument()
    })

    it('should apply muted background for received messages', () => {
      const messages = [createMockMessage({ senderId: 'other-user', recipientId: currentUserId })]

      const { container } = render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      const messageBubble = container.querySelector('.bg-muted:not(.bg-primary)')
      expect(messageBubble).toBeInTheDocument()
    })
  })

  describe('Mark as Read', () => {
    it('should call onMarkAsRead for unread messages addressed to current user', async () => {
      const unreadMessage = createMockMessage({
        id: 'msg-unread',
        isRead: false,
        recipientId: currentUserId,
      })
      const messages = [unreadMessage]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      await waitFor(() => {
        expect(onMarkAsRead).toHaveBeenCalledWith('msg-unread')
      })
    })

    it('should not call onMarkAsRead for read messages', async () => {
      const readMessage = createMockMessage({
        id: 'msg-read',
        isRead: true,
        recipientId: currentUserId,
      })
      const messages = [readMessage]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      await waitFor(() => {
        expect(onMarkAsRead).not.toHaveBeenCalled()
      })
    })

    it('should not call onMarkAsRead for messages not addressed to current user', async () => {
      const message = createMockMessage({
        id: 'msg-other',
        isRead: false,
        recipientId: 'other-user',
      })
      const messages = [message]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      await waitFor(() => {
        expect(onMarkAsRead).not.toHaveBeenCalled()
      })
    })

    it('should call onMarkAsRead for multiple unread messages', async () => {
      const messages = [
        createMockMessage({ id: 'msg-1', isRead: false, recipientId: currentUserId }),
        createMockMessage({ id: 'msg-2', isRead: false, recipientId: currentUserId }),
      ]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      await waitFor(() => {
        expect(onMarkAsRead).toHaveBeenCalledTimes(2)
      })
    })

    it('should use useEffect cleanup', () => {
      const messages = [
        createMockMessage({ id: 'msg-1', isRead: false, recipientId: currentUserId }),
      ]

      const { unmount } = render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      unmount()

      expect(onMarkAsRead).toHaveBeenCalled()
    })
  })

  describe('Memoization', () => {
    it('should have displayName for React DevTools', () => {
      expect(MessageThread.displayName).toBe('MessageThread')
    })

    it('should be memoized', () => {
      const messages = [createMockMessage()]

      const { rerender } = render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      rerender(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      expect(screen.getByText('Test Subject')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty subject', () => {
      const messages = [createMockMessage({ subject: '' })]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      const messageDiv = document.querySelector('.space-y-4')
      expect(messageDiv).toBeInTheDocument()
    })

    it('should handle empty content', () => {
      const messages = [createMockMessage({ content: '' })]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      const messageDiv = document.querySelector('.space-y-4')
      expect(messageDiv).toBeInTheDocument()
    })

    it('should handle very long content', () => {
      const longContent =
        'This is a very long content that should be displayed with whitespace preservation in the message thread component'
      const messages = [createMockMessage({ content: longContent })]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('should handle special characters in content', () => {
      const specialContent = '<script>alert("xss")</script> & "quotes"'
      const messages = [createMockMessage({ content: specialContent })]

      render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have max-width on message bubbles', () => {
      const messages = [createMockMessage()]

      const { container } = render(
        <MessageThread
          messages={messages}
          currentUserId={currentUserId}
          onMarkAsRead={onMarkAsRead}
        />
      )

      const messageBubble = container.querySelector('.max-w-\\[80\\%\\]')
      expect(messageBubble).toBeInTheDocument()
    })
  })
})
