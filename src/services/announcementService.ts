import type { IRepository } from '@/repositories/IRepository'
import type { Announcement, CreateAnnouncementData } from '@shared/types'

export interface AnnouncementEndpoints {
  list: () => string
  listByUser?: (userId: string) => string
  create: () => string
  delete?: (announcementId: string) => string
}

export interface AnnouncementService {
  getAnnouncements(userId?: string): Promise<Announcement[]>
  createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement>
  deleteAnnouncement?(announcementId: string): Promise<void>
}

export function createAnnouncementService(
  repository: IRepository,
  endpoints: AnnouncementEndpoints
): AnnouncementService {
  return {
    async getAnnouncements(userId?: string): Promise<Announcement[]> {
      if (userId && endpoints.listByUser) {
        return repository.get<Announcement[]>(endpoints.listByUser(userId))
      }
      return repository.get<Announcement[]>(endpoints.list())
    },

    async createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement> {
      return repository.post<Announcement>(endpoints.create(), announcement)
    },

    async deleteAnnouncement(announcementId: string): Promise<void> {
      if (endpoints.delete) {
        return repository.delete<void>(endpoints.delete(announcementId))
      }
      throw new Error('Delete announcement endpoint not configured')
    },
  }
}
