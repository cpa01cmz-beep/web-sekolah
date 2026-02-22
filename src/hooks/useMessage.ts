import { useQuery as useTanstackQuery, useMutation as useTanstackMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type { Message } from '@shared/types';
import type { SendMessageData } from '@/services/serviceContracts';
import type { MessageService } from '@/services/messageService';
import { CachingTime, PollingInterval } from '@/config/time';
import { createQueryOptions } from '@/config/query-config';
import { logger } from '@/lib/logger';

export interface UseMessagesOptions {
  userId: string;
  type?: 'inbox' | 'sent';
  options?: UseQueryOptions<Message[]>;
}

export interface UseUnreadCountOptions {
  userId: string;
  options?: UseQueryOptions<number>;
}

export interface UseConversationOptions {
  userId: string;
  otherUserId: string | null;
  options?: UseQueryOptions<Message[]>;
}

export interface UseSendMessageOptions {
  userId: string;
  onSuccess?: () => void;
  options?: Omit<UseMutationOptions<Message, Error, SendMessageData>, 'mutationFn'>;
}

export interface UseMarkAsReadOptions {
  userId: string;
  onSuccess?: () => void;
  options?: Omit<UseMutationOptions<Message, Error, string>, 'mutationFn'>;
}

export function createMessageHooks(
  service: MessageService,
  queryKeyPrefix: string
) {
  const messageKey = (userId: string, type?: 'inbox' | 'sent') => 
    type ? [queryKeyPrefix, userId, 'messages', type] : [queryKeyPrefix, userId, 'messages'];
  
  const unreadCountKey = (userId: string) => [queryKeyPrefix, userId, 'unread-count'];
  const conversationKey = (userId: string, otherUserId: string) => [queryKeyPrefix, userId, 'conversation', otherUserId];

  function useMessages({ userId, type = 'inbox', options }: UseMessagesOptions) {
    return useTanstackQuery({
      queryKey: messageKey(userId, type),
      queryFn: () => service.getMessages(userId, type),
      ...createQueryOptions<Message[]>({ enabled: !!userId, staleTime: CachingTime.FIVE_MINUTES }),
      ...options,
    });
  }

  function useUnreadCount({ userId, options }: UseUnreadCountOptions) {
    return useTanstackQuery({
      queryKey: unreadCountKey(userId),
      queryFn: () => service.getUnreadCount(userId),
      ...createQueryOptions<number>({ enabled: !!userId }),
      refetchInterval: PollingInterval.THIRTY_SECONDS,
      ...options,
    });
  }

  function useConversation({ userId, otherUserId, options }: UseConversationOptions) {
    return useTanstackQuery({
      queryKey: otherUserId ? conversationKey(userId, otherUserId) : [],
      queryFn: () => service.getConversation(userId, otherUserId!),
      ...createQueryOptions<Message[]>({ enabled: !!userId && !!otherUserId, staleTime: CachingTime.FIVE_MINUTES }),
      ...options,
    });
  }

  function useSendMessage({ userId, onSuccess, options }: UseSendMessageOptions) {
    const queryClient = useQueryClient();

    return useTanstackMutation({
      mutationFn: (data: SendMessageData) => service.sendMessage(userId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, userId, 'messages'] });
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, userId, 'conversation'] });
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, userId, 'unread-count'] });
        onSuccess?.();
      },
      onError: (error) => {
        logger.error('Failed to send message', error);
      },
      ...options,
    });
  }

  function useMarkAsRead({ userId, onSuccess, options }: UseMarkAsReadOptions) {
    const queryClient = useQueryClient();

    return useTanstackMutation({
      mutationFn: (messageId: string) => service.markAsRead(userId, messageId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, userId, 'messages'] });
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix, userId, 'unread-count'] });
        onSuccess?.();
      },
      ...options,
    });
  }

  return {
    useMessages,
    useUnreadCount,
    useConversation,
    useSendMessage,
    useMarkAsRead,
  };
}

import { teacherService } from '@/services/teacherService';
import { parentService } from '@/services/parentService';

export const teacherMessageHooks = createMessageHooks(teacherService, 'teacher');
export const parentMessageHooks = createMessageHooks(parentService, 'parent');
