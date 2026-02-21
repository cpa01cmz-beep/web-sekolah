import type { ParentService, SendMessageData } from './serviceContracts';
import type { ParentDashboardData, ScheduleItem, Message, SchoolUser } from '@shared/types';
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { createMessageService } from './messageService';

const parentMessageEndpoints = {
  messages: API_ENDPOINTS.PARENTS.MESSAGES,
  messageRead: API_ENDPOINTS.PARENTS.MESSAGE_READ,
  messageConversation: API_ENDPOINTS.PARENTS.MESSAGE_CONVERSATION,
  unreadCount: API_ENDPOINTS.PARENTS.UNREAD_COUNT,
};

export function createParentService(repository: IRepository = apiRepository): ParentService {
  const messageService = createMessageService(repository, parentMessageEndpoints);

  return {
    async getDashboard(parentId: string): Promise<ParentDashboardData> {
      return repository.get<ParentDashboardData>(API_ENDPOINTS.PARENTS.DASHBOARD(parentId));
    },

    async getChildSchedule(parentId: string): Promise<ScheduleItem[]> {
      return repository.get<ScheduleItem[]>(API_ENDPOINTS.PARENTS.SCHEDULE(parentId));
    },

    getMessages: (parentId: string, type?: 'inbox' | 'sent') =>
      messageService.getMessages(parentId, type),
    getUnreadCount: (parentId: string) => messageService.getUnreadCount(parentId),
    getConversation: (parentId: string, teacherId: string) =>
      messageService.getConversation(parentId, teacherId),
    sendMessage: (parentId: string, data: SendMessageData) =>
      messageService.sendMessage(parentId, data),
    markAsRead: (parentId: string, messageId: string) =>
      messageService.markAsRead(parentId, messageId),

    async getChildTeachers(parentId: string): Promise<SchoolUser[]> {
      return repository.get<SchoolUser[]>(API_ENDPOINTS.PARENTS.TEACHERS(parentId));
    },
  };
}

export const parentService = createParentService();
