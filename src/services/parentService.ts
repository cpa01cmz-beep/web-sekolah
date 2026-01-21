import type { ParentService } from './serviceContracts';
import type {
  ParentDashboardData,
  ScheduleItem
} from '@shared/types';
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';

export function createParentService(repository: IRepository = apiRepository): ParentService {
  return {
    async getDashboard(parentId: string): Promise<ParentDashboardData> {
      return repository.get<ParentDashboardData>(`/api/parents/${parentId}/dashboard`);
    },

    async getChildSchedule(_childId: string): Promise<ScheduleItem[]> {
      return repository.get<ScheduleItem[]>(`/api/parents/me/schedule`);
    }
  };
}

export const parentService = createParentService();
