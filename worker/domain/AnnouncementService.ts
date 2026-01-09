import type { Env } from '../core-utils';
import { AnnouncementEntity } from '../entities';
import type { Announcement, CreateAnnouncementData } from '@shared/types';
import { ReferentialIntegrity } from '../referential-integrity';
import { DateSortedSecondaryIndex } from '../storage/DateSortedSecondaryIndex';

export class AnnouncementService {
  static async createAnnouncement(
    env: Env,
    announcementData: CreateAnnouncementData,
    authorId: string
  ): Promise<Announcement> {
    if (!announcementData.title || !announcementData.content) {
      throw new Error('title and content are required');
    }

    const now = new Date().toISOString();
    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      title: announcementData.title,
      content: announcementData.content,
      date: now,
      targetRole: announcementData.targetRole || 'all',
      authorId,
      createdAt: now,
      updatedAt: now
    };

    const validation = await ReferentialIntegrity.validateAnnouncement(env, newAnnouncement);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    await AnnouncementEntity.createWithDateIndex(env, newAnnouncement);
    return newAnnouncement;
  }

  static async updateAnnouncement(env: Env, announcementId: string, updates: Partial<CreateAnnouncementData>): Promise<Announcement> {
    if (announcementId === 'null' || !announcementId) {
      throw new Error('Announcement ID is required');
    }

    const announcementEntity = new AnnouncementEntity(env, announcementId);
    
    if (!await announcementEntity.exists()) {
      throw new Error('Announcement not found');
    }

    const updateData: Partial<Announcement> = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await announcementEntity.patch(updateData);
    const updatedAnnouncement = await announcementEntity.getState();
    return updatedAnnouncement!;
  }

  static async getAnnouncementById(env: Env, announcementId: string): Promise<Announcement | null> {
    const announcementEntity = new AnnouncementEntity(env, announcementId);
    return await announcementEntity.getState();
  }

  static async getAnnouncementsByAuthor(env: Env, authorId: string): Promise<Announcement[]> {
    return await AnnouncementEntity.getByAuthorId(env, authorId);
  }

  static async getAnnouncementsByTargetRole(env: Env, targetRole: string): Promise<Announcement[]> {
    return await AnnouncementEntity.getByTargetRole(env, targetRole);
  }

  static async getRecentAnnouncements(env: Env, limit: number): Promise<Announcement[]> {
    return await AnnouncementEntity.getRecent(env, limit);
  }

  static async deleteAnnouncement(env: Env, announcementId: string): Promise<boolean> {
    return await AnnouncementEntity.deleteWithDateIndex(env, announcementId);
  }
}
