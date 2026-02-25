import type { AdminService } from './serviceContracts'
import type {
  AdminDashboardData,
  SchoolUser,
  UserFilters,
  CreateUserData,
  UpdateUserData,
  Announcement,
  CreateAnnouncementData,
  Settings,
} from '@shared/types'
import type { IRepository } from '@/repositories/IRepository'
import { apiRepository } from '@/repositories/ApiRepository'
import { API_ENDPOINTS } from '@/config/api-endpoints'
import { createAnnouncementService } from './announcementService'

const adminAnnouncementEndpoints = {
  list: () => API_ENDPOINTS.ADMIN.ANNOUNCEMENTS,
  create: () => API_ENDPOINTS.ADMIN.ANNOUNCEMENTS,
  update: API_ENDPOINTS.ADMIN.UPDATE_ANNOUNCEMENT,
  delete: API_ENDPOINTS.ADMIN.ANNOUNCEMENT,
}

export function createAdminService(repository: IRepository = apiRepository): AdminService {
  const announcementService = createAnnouncementService(repository, adminAnnouncementEndpoints)

  return {
    async getDashboard(): Promise<AdminDashboardData> {
      return repository.get<AdminDashboardData>(API_ENDPOINTS.ADMIN.DASHBOARD)
    },

    async getUsers(filters?: UserFilters): Promise<SchoolUser[]> {
      const queryParams = new URLSearchParams()
      if (filters?.role) queryParams.append('role', filters.role)
      if (filters?.classId) queryParams.append('classId', filters.classId)
      if (filters?.search) queryParams.append('search', filters.search)

      const queryString = queryParams.toString()
      const endpoint = queryString
        ? `${API_ENDPOINTS.ADMIN.USERS}?${queryString}`
        : API_ENDPOINTS.ADMIN.USERS
      return repository.get<SchoolUser[]>(endpoint)
    },

    async createUser(userData: CreateUserData): Promise<SchoolUser> {
      return repository.post<SchoolUser>(API_ENDPOINTS.ADMIN.USERS, userData)
    },

    async updateUser(userId: string, userData: UpdateUserData): Promise<SchoolUser> {
      return repository.put<SchoolUser>(API_ENDPOINTS.ADMIN.USER(userId), userData)
    },

    async deleteUser(userId: string): Promise<void> {
      return repository.delete<void>(API_ENDPOINTS.ADMIN.USER(userId))
    },

    getAnnouncements: () => announcementService.getAnnouncements(),
    createAnnouncement: (announcement: CreateAnnouncementData) =>
      announcementService.createAnnouncement(announcement),
    updateAnnouncement: (announcementId: string, announcement: Partial<CreateAnnouncementData>) =>
      announcementService.updateAnnouncement!(announcementId, announcement),
    deleteAnnouncement: (announcementId: string) =>
      announcementService.deleteAnnouncement!(announcementId),

    async getSettings(): Promise<Settings> {
      return repository.get<Settings>(API_ENDPOINTS.ADMIN.SETTINGS)
    },

    async updateSettings(settings: Partial<Settings>): Promise<Settings> {
      return repository.put<Settings>(API_ENDPOINTS.ADMIN.SETTINGS, settings)
    },
  }
}

export const adminService = createAdminService()
