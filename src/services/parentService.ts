import { apiClient } from '@/lib/api-client';
import type { ParentService } from './serviceContracts';
import type {
  ParentDashboardData,
  ScheduleItem
} from '@shared/types';

export const parentService: ParentService = {
  async getDashboard(parentId: string): Promise<ParentDashboardData> {
    return apiClient<ParentDashboardData>(`/api/parents/${parentId}/dashboard`);
  },

  async getChildSchedule(childId: string): Promise<ScheduleItem[]> {
    return apiClient<ScheduleItem[]>(`/api/students/${childId}/schedule`);
  }
};
