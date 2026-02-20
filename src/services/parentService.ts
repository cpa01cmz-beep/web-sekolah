import type { ParentService, SendMessageData } from './serviceContracts';
import type {
  ParentDashboardData,
  ScheduleItem,
  Message,
  SchoolUser
} from '@shared/types';
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { createMessagingService } from './messagingService';

export function createParentService(repository: IRepository = apiRepository): ParentService {
  return {
    async getDashboard(parentId: string): Promise<ParentDashboardData> {
      return repository.get<ParentDashboardData>(API_ENDPOINTS.PARENTS.DASHBOARD(parentId));
    },

    async getChildSchedule(parentId: string): Promise<ScheduleItem[]> {
      return repository.get<ScheduleItem[]>(API_ENDPOINTS.PARENTS.SCHEDULE(parentId));
    },

    async getMessages(parentId: string, type: 'inbox' | 'sent' = 'inbox'): Promise<Message[]> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.PARENTS.MESSAGES(parentId));
      return messaging.getMessages(type);
    },

    async getUnreadCount(parentId: string): Promise<number> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.PARENTS.MESSAGES(parentId));
      return messaging.getUnreadCount();
    },

    async getConversation(parentId: string, teacherId: string): Promise<Message[]> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.PARENTS.MESSAGES(parentId));
      return messaging.getConversation(teacherId);
    },

    async sendMessage(parentId: string, data: SendMessageData): Promise<Message> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.PARENTS.MESSAGES(parentId));
      return messaging.sendMessage(data);
    },

    async markAsRead(parentId: string, messageId: string): Promise<Message> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.PARENTS.MESSAGES(parentId));
      return messaging.markAsRead(messageId);
    },

    async getChildTeachers(parentId: string): Promise<SchoolUser[]> {
      return repository.get<SchoolUser[]>(
        API_ENDPOINTS.PARENTS.DASHBOARD(parentId).replace('/dashboard', '/teachers')
      );
    }
  };
}

export const parentService = createParentService();
