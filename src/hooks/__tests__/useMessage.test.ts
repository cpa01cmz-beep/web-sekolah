import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createMessageHooks } from '../useMessage';
import type { Message } from '@shared/types';
import type { MessageService } from '@/services/messageService';

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'user-1',
    recipientId: 'user-2',
    subject: 'Test Subject',
    content: 'Test content',
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    senderName: 'John Doe',
    recipientName: 'Jane Smith',
  },
  {
    id: 'msg-2',
    senderId: 'user-2',
    recipientId: 'user-1',
    subject: 'Reply Subject',
    content: 'Reply content',
    isRead: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    senderName: 'Jane Smith',
    recipientName: 'John Doe',
  },
];

describe('createMessageHooks', () => {
  let testQueryClient: QueryClient;
  let mockService: MessageService;

  const createTestWrapper = () => {
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
        mutations: {
          retry: false,
        },
      },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client: testQueryClient }, children);
    };
  };

  const createMockService = (): MessageService => ({
    getMessages: vi.fn(),
    getUnreadCount: vi.fn(),
    getConversation: vi.fn(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = createMockService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useMessages', () => {
    it('should return messages', async () => {
      (mockService.getMessages as any).mockResolvedValueOnce(mockMessages);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMessages({ userId: 'user-1', type: 'inbox' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMessages);
      expect(mockService.getMessages).toHaveBeenCalledWith('user-1', 'inbox');
    });

    it('should not execute query when userId is empty', () => {
      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMessages({ userId: '', type: 'inbox' }),
        { wrapper: createTestWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle error state', async () => {
      (mockService.getMessages as any).mockRejectedValueOnce(new Error('Network error'));

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMessages({ userId: 'user-1', type: 'inbox' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle empty messages array', async () => {
      (mockService.getMessages as any).mockResolvedValueOnce([]);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMessages({ userId: 'user-1', type: 'inbox' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should default to inbox type', async () => {
      (mockService.getMessages as any).mockResolvedValueOnce(mockMessages);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMessages({ userId: 'user-1' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockService.getMessages).toHaveBeenCalledWith('user-1', 'inbox');
    });

    it('should fetch sent messages when type is sent', async () => {
      (mockService.getMessages as any).mockResolvedValueOnce(mockMessages);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMessages({ userId: 'user-1', type: 'sent' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockService.getMessages).toHaveBeenCalledWith('user-1', 'sent');
    });
  });

  describe('useUnreadCount', () => {
    it('should return unread count', async () => {
      (mockService.getUnreadCount as any).mockResolvedValueOnce(5);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useUnreadCount({ userId: 'user-1' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(5);
    });

    it('should not execute query when userId is empty', () => {
      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useUnreadCount({ userId: '' }),
        { wrapper: createTestWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle zero unread count', async () => {
      (mockService.getUnreadCount as any).mockResolvedValueOnce(0);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useUnreadCount({ userId: 'user-1' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(0);
    });

    it('should handle error state', async () => {
      (mockService.getUnreadCount as any).mockRejectedValueOnce(new Error('Network error'));

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useUnreadCount({ userId: 'user-1' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useConversation', () => {
    it('should return conversation messages', async () => {
      (mockService.getConversation as any).mockResolvedValueOnce(mockMessages);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useConversation({ userId: 'user-1', otherUserId: 'user-2' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMessages);
      expect(mockService.getConversation).toHaveBeenCalledWith('user-1', 'user-2');
    });

    it('should not execute query when userId is empty', () => {
      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useConversation({ userId: '', otherUserId: 'user-2' }),
        { wrapper: createTestWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not execute query when otherUserId is null', () => {
      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useConversation({ userId: 'user-1', otherUserId: null }),
        { wrapper: createTestWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not execute query when otherUserId is empty', () => {
      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useConversation({ userId: 'user-1', otherUserId: '' }),
        { wrapper: createTestWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle empty conversation', async () => {
      (mockService.getConversation as any).mockResolvedValueOnce([]);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useConversation({ userId: 'user-1', otherUserId: 'user-2' }),
        { wrapper: createTestWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useSendMessage', () => {
    it('should send message successfully', async () => {
      const newMessage: Message = {
        id: 'msg-3',
        senderId: 'user-1',
        recipientId: 'user-2',
        subject: 'New Subject',
        content: 'New content',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderName: 'John Doe',
        recipientName: 'Jane Smith',
      };
      (mockService.sendMessage as any).mockResolvedValueOnce(newMessage);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useSendMessage({ userId: 'user-1' }),
        { wrapper: createTestWrapper() }
      );

      await act(async () => {
        result.current.mutate({
          recipientId: 'user-2',
          subject: 'New Subject',
          content: 'New content',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newMessage);
      expect(mockService.sendMessage).toHaveBeenCalledWith('user-1', {
        recipientId: 'user-2',
        subject: 'New Subject',
        content: 'New content',
      });
    });

    it('should call onSuccess callback', async () => {
      (mockService.sendMessage as any).mockResolvedValueOnce(mockMessages[0]);
      const onSuccess = vi.fn();

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useSendMessage({ userId: 'user-1', onSuccess }),
        { wrapper: createTestWrapper() }
      );

      await act(async () => {
        result.current.mutate({
          recipientId: 'user-2',
          subject: 'Test',
          content: 'Test',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle error state', async () => {
      (mockService.sendMessage as any).mockRejectedValueOnce(new Error('Send failed'));

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useSendMessage({ userId: 'user-1' }),
        { wrapper: createTestWrapper() }
      );

      await act(async () => {
        result.current.mutate({
          recipientId: 'user-2',
          subject: 'Test',
          content: 'Test',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useMarkAsRead', () => {
    it('should mark message as read successfully', async () => {
      const readMessage = { ...mockMessages[0], isRead: true };
      (mockService.markAsRead as any).mockResolvedValueOnce(readMessage);

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMarkAsRead({ userId: 'user-1' }),
        { wrapper: createTestWrapper() }
      );

      await act(async () => {
        result.current.mutate('msg-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(readMessage);
      expect(mockService.markAsRead).toHaveBeenCalledWith('user-1', 'msg-1');
    });

    it('should call onSuccess callback', async () => {
      (mockService.markAsRead as any).mockResolvedValueOnce(mockMessages[0]);
      const onSuccess = vi.fn();

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMarkAsRead({ userId: 'user-1', onSuccess }),
        { wrapper: createTestWrapper() }
      );

      await act(async () => {
        result.current.mutate('msg-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle error state', async () => {
      (mockService.markAsRead as any).mockRejectedValueOnce(new Error('Mark failed'));

      const hooks = createMessageHooks(mockService, 'test-messages');
      const { result } = renderHook(
        () => hooks.useMarkAsRead({ userId: 'user-1' }),
        { wrapper: createTestWrapper() }
      );

      await act(async () => {
        result.current.mutate('msg-1');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('query key prefix isolation', () => {
    it('should create separate hooks with different query key prefixes', () => {
      const teacherHooks = createMessageHooks(mockService, 'teacher-messages');
      const parentHooks = createMessageHooks(mockService, 'parent-messages');

      expect(teacherHooks.useMessages).toBeDefined();
      expect(parentHooks.useMessages).toBeDefined();
      expect(teacherHooks).not.toBe(parentHooks);
    });
  });
});
