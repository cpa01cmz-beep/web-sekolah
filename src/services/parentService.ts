import type { ParentService } from './serviceContracts';
import type {
  ParentDashboardData,
  ScheduleItem
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
    }
  };
}

export const parentService = createParentService();
