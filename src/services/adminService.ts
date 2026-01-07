import type { AdminService } from './serviceContracts';
import type {
  AdminDashboardData,
  SchoolUser,
  UserFilters,
  CreateUserData,
  UpdateUserData,
  Announcement,
  CreateAnnouncementData,
  Settings
} from '@shared/types';
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';

export function createAdminService(repository: IRepository = apiRepository): AdminService {
  return {
    async getDashboard(): Promise<AdminDashboardData> {
      return repository.get<AdminDashboardData>(`/api/admin/dashboard`);
    },

    async getUsers(filters?: UserFilters): Promise<SchoolUser[]> {
      const queryParams = new URLSearchParams();
      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.classId) queryParams.append('classId', filters.classId);
      if (filters?.search) queryParams.append('search', filters.search);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/admin/users?${queryString}` : '/api/admin/users';
      return repository.get<SchoolUser[]>(endpoint);
    },

    async createUser(userData: CreateUserData): Promise<SchoolUser> {
      return repository.post<SchoolUser>(`/api/admin/users`, userData);
    },

    async updateUser(userId: string, userData: UpdateUserData): Promise<SchoolUser> {
      return repository.put<SchoolUser>(`/api/admin/users/${userId}`, userData);
    },

    async deleteUser(userId: string): Promise<void> {
      return repository.delete<void>(`/api/admin/users/${userId}`);
    },

    async getAnnouncements(): Promise<Announcement[]> {
      return repository.get<Announcement[]>(`/api/admin/announcements`);
    },

    async createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement> {
      return repository.post<Announcement>(`/api/admin/announcements`, announcement);
    },

    async getSettings(): Promise<Settings> {
      return repository.get<Settings>(`/api/admin/settings`);
    },

    async updateSettings(settings: Partial<Settings>): Promise<Settings> {
      return repository.put<Settings>(`/api/admin/settings`, settings);
    }
  };
}

export const adminService = createAdminService();
