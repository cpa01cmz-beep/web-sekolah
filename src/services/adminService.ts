import { apiClient } from '@/lib/api-client';
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

export const adminService: AdminService = {
  async getDashboard(): Promise<AdminDashboardData> {
    return apiClient<AdminDashboardData>(`/api/admin/dashboard`);
  },

  async getUsers(filters?: UserFilters): Promise<SchoolUser[]> {
    const queryParams = new URLSearchParams();
    if (filters?.role) queryParams.append('role', filters.role);
    if (filters?.classId) queryParams.append('classId', filters.classId);
    if (filters?.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/admin/users?${queryString}` : '/api/admin/users';
    return apiClient<SchoolUser[]>(endpoint);
  },

  async createUser(userData: CreateUserData): Promise<SchoolUser> {
    return apiClient<SchoolUser>(`/api/admin/users`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(userId: string, userData: UpdateUserData): Promise<SchoolUser> {
    return apiClient<SchoolUser>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  async deleteUser(userId: string): Promise<void> {
    return apiClient<void>(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  async getAnnouncements(): Promise<Announcement[]> {
    return apiClient<Announcement[]>(`/api/admin/announcements`);
  },

  async createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement> {
    return apiClient<Announcement>(`/api/admin/announcements`, {
      method: 'POST',
      body: JSON.stringify(announcement)
    });
  },

  async getSettings(): Promise<Settings> {
    return apiClient<Settings>(`/api/admin/settings`);
  },

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    return apiClient<Settings>(`/api/admin/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};
