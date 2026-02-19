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

export function createParentService(repository: IRepository = apiRepository): ParentService {
  return {
    async getDashboard(parentId: string): Promise<ParentDashboardData> {
      return repository.get<ParentDashboardData>(API_ENDPOINTS.PARENTS.DASHBOARD(parentId));
    },

    async getChildSchedule(parentId: string): Promise<ScheduleItem[]> {
      return repository.get<ScheduleItem[]>(API_ENDPOINTS.PARENTS.SCHEDULE(parentId));
    },

    async getMessages(parentId: string, type: 'inbox' | 'sent' = 'inbox'): Promise<Message[]> {
      return repository.get<Message[]>(`${API_ENDPOINTS.PARENTS.DASHBOARD(parentId).replace('/dashboard', '/messages')}?type=${type}`);
    },

    async getUnreadCount(parentId: string): Promise<number> {
      const result = await repository.get<{ count: number }>(
        API_ENDPOINTS.PARENTS.DASHBOARD(parentId).replace('/dashboard', '/messages/unread-count')
      );
      return result.count;
    },

    async getConversation(parentId: string, teacherId: string): Promise<Message[]> {
      return repository.get<Message[]>(
        `${API_ENDPOINTS.PARENTS.DASHBOARD(parentId).replace('/dashboard', '/messages')}/${teacherId}/conversation`
      );
    },

    async sendMessage(parentId: string, data: SendMessageData): Promise<Message> {
      return repository.post<Message>(
        API_ENDPOINTS.PARENTS.DASHBOARD(parentId).replace('/dashboard', '/messages'),
        data
      );
    },

    async markAsRead(parentId: string, messageId: string): Promise<Message> {
      return repository.post<Message>(
        `${API_ENDPOINTS.PARENTS.DASHBOARD(parentId).replace('/dashboard', '/messages')}/${messageId}/read`,
        {}
      );
    },

    async getChildTeachers(parentId: string): Promise<SchoolUser[]> {
      return repository.get<SchoolUser[]>(
        API_ENDPOINTS.PARENTS.DASHBOARD(parentId).replace('/dashboard', '/teachers')
      );
    }
  };
}

export const parentService = createParentService();
