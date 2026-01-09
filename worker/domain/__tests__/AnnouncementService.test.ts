import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnnouncementService } from '../AnnouncementService';
import { AnnouncementEntity } from '../../entities';
import { ReferentialIntegrity } from '../../referential-integrity';
import { WebhookService } from '../../webhook-service';
import type { Env } from '../../core-utils';
import type { Announcement, CreateAnnouncementData } from '@shared/types';

vi.mock('../../entities');
vi.mock('../../referential-integrity');
vi.mock('../../webhook-service');

describe('AnnouncementService', () => {
  let mockEnv: Env;
  let mockAnnouncementData: CreateAnnouncementData;
  let mockAuthorId: string;
  let mockAnnouncement: Announcement;

  beforeEach(() => {
    mockEnv = {} as Env;
    mockAnnouncementData = {
      title: 'Test Announcement',
      content: 'Test Content',
      targetRole: 'all'
    };
    mockAuthorId = 'user-123';

    const now = new Date().toISOString();
    mockAnnouncement = {
      id: 'announcement-123',
      title: 'Test Announcement',
      content: 'Test Content',
      date: now,
      targetRole: 'all',
      authorId: mockAuthorId,
      createdAt: now,
      updatedAt: now
    };

    vi.clearAllMocks();
  });

  describe('createAnnouncement', () => {
    it('should create announcement with valid data', async () => {
      vi.mocked(ReferentialIntegrity.validateAnnouncement).mockResolvedValue({ valid: true });
      vi.mocked(AnnouncementEntity.createWithDateIndex).mockResolvedValue(mockAnnouncement);

      const result = await AnnouncementService.createAnnouncement(mockEnv, mockAnnouncementData, mockAuthorId);

      expect(result.title).toBe('Test Announcement');
      expect(result.content).toBe('Test Content');
      expect(result.authorId).toBe(mockAuthorId);
      expect(ReferentialIntegrity.validateAnnouncement).toHaveBeenCalledWith(mockEnv, expect.objectContaining({
        title: 'Test Announcement',
        content: 'Test Content',
        authorId: mockAuthorId
      }));
    });

    it('should throw error when title is missing', async () => {
      const invalidData = { ...mockAnnouncementData, title: '' };

      await expect(AnnouncementService.createAnnouncement(mockEnv, invalidData, mockAuthorId))
        .rejects.toThrow('title and content are required');
    });

    it('should throw error when content is missing', async () => {
      const invalidData = { ...mockAnnouncementData, content: '' };

      await expect(AnnouncementService.createAnnouncement(mockEnv, invalidData, mockAuthorId))
        .rejects.toThrow('title and content are required');
    });

    it('should throw error when referential validation fails', async () => {
      vi.mocked(ReferentialIntegrity.validateAnnouncement).mockResolvedValue({
        valid: false,
        error: 'Author not found'
      });

      await expect(AnnouncementService.createAnnouncement(mockEnv, mockAnnouncementData, mockAuthorId))
        .rejects.toThrow('Author not found');
    });

    it('should default targetRole to all when not provided', async () => {
      vi.mocked(ReferentialIntegrity.validateAnnouncement).mockResolvedValue({ valid: true });
      vi.mocked(AnnouncementEntity.createWithDateIndex).mockResolvedValue(mockAnnouncement);

      const dataWithoutTargetRole = { ...mockAnnouncementData, targetRole: undefined };

      const result = await AnnouncementService.createAnnouncement(mockEnv, dataWithoutTargetRole as CreateAnnouncementData, mockAuthorId);

      expect(result.targetRole).toBe('all');
    });

    it('should create announcement with date-sorted index', async () => {
      vi.mocked(ReferentialIntegrity.validateAnnouncement).mockResolvedValue({ valid: true });
      vi.mocked(AnnouncementEntity.createWithDateIndex).mockResolvedValue(mockAnnouncement);

      await AnnouncementService.createAnnouncement(mockEnv, mockAnnouncementData, mockAuthorId);

      expect(AnnouncementEntity.createWithDateIndex).toHaveBeenCalledWith(mockEnv, expect.objectContaining({
        date: expect.any(String),
        targetRole: 'all'
      }));
    });
  });

  describe('updateAnnouncement', () => {
    it('should update announcement with valid ID', async () => {
      const mockUpdate = { title: 'Updated Title', content: 'Updated Content' };
      const mockUpdatedAnnouncement = { ...mockAnnouncement, ...mockUpdate };
      vi.mocked(AnnouncementEntity.prototype.patch).mockResolvedValue();
      vi.mocked(AnnouncementEntity.prototype.getState).mockResolvedValue(mockUpdatedAnnouncement);
      vi.mocked(AnnouncementEntity.prototype.exists).mockResolvedValue(true);

      const result = await AnnouncementService.updateAnnouncement(mockEnv, 'announcement-123', mockUpdate);

      expect(result.title).toBe('Updated Title');
      expect(result.content).toBe('Updated Content');
      expect(AnnouncementEntity.prototype.patch).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Updated Title',
        content: 'Updated Content',
        updatedAt: expect.any(String)
      }));
    });

    it('should throw error when announcement ID is null', async () => {
      await expect(AnnouncementService.updateAnnouncement(mockEnv, 'null', { title: 'Test' }))
        .rejects.toThrow('Announcement ID is required');
    });

    it('should throw error when announcement does not exist', async () => {
      vi.mocked(AnnouncementEntity.prototype.exists).mockResolvedValue(false);

      await expect(AnnouncementService.updateAnnouncement(mockEnv, 'announcement-123', { title: 'Test' }))
        .rejects.toThrow('Announcement not found');
    });
  });

  describe('getAnnouncementById', () => {
    it('should return announcement when found', async () => {
      vi.mocked(AnnouncementEntity.prototype.getState).mockResolvedValue(mockAnnouncement);

      const result = await AnnouncementService.getAnnouncementById(mockEnv, 'announcement-123');

      expect(result).toEqual(mockAnnouncement);
    });

    it('should return null when announcement not found', async () => {
      vi.mocked(AnnouncementEntity.prototype.getState).mockResolvedValue(null);

      const result = await AnnouncementService.getAnnouncementById(mockEnv, 'announcement-123');

      expect(result).toBeNull();
    });
  });

  describe('getAnnouncementsByAuthor', () => {
    it('should return announcements by author', async () => {
      const mockAnnouncements = [mockAnnouncement];
      vi.mocked(AnnouncementEntity.getByAuthorId).mockResolvedValue(mockAnnouncements);

      const result = await AnnouncementService.getAnnouncementsByAuthor(mockEnv, 'user-123');

      expect(result).toEqual(mockAnnouncements);
      expect(AnnouncementEntity.getByAuthorId).toHaveBeenCalledWith(mockEnv, 'user-123');
    });
  });

  describe('getAnnouncementsByTargetRole', () => {
    it('should return announcements by target role', async () => {
      const mockAnnouncements = [mockAnnouncement];
      vi.mocked(AnnouncementEntity.getByTargetRole).mockResolvedValue(mockAnnouncements);

      const result = await AnnouncementService.getAnnouncementsByTargetRole(mockEnv, 'student');

      expect(result).toEqual(mockAnnouncements);
      expect(AnnouncementEntity.getByTargetRole).toHaveBeenCalledWith(mockEnv, 'student');
    });
  });

  describe('getRecentAnnouncements', () => {
    it('should return recent announcements with limit', async () => {
      const mockRecentAnnouncements = [mockAnnouncement];
      vi.mocked(AnnouncementEntity.getRecent).mockResolvedValue(mockRecentAnnouncements);

      const result = await AnnouncementService.getRecentAnnouncements(mockEnv, 5);

      expect(result).toEqual(mockRecentAnnouncements);
      expect(AnnouncementEntity.getRecent).toHaveBeenCalledWith(mockEnv, 5);
    });
  });

  describe('deleteAnnouncement', () => {
    it('should delete announcement', async () => {
      vi.mocked(AnnouncementEntity.deleteWithDateIndex).mockResolvedValue(true);

      const result = await AnnouncementService.deleteAnnouncement(mockEnv, 'announcement-123');

      expect(result).toBe(true);
      expect(AnnouncementEntity.deleteWithDateIndex).toHaveBeenCalledWith(mockEnv, 'announcement-123');
    });

    it('should return false when deletion fails', async () => {
      vi.mocked(AnnouncementEntity.deleteWithDateIndex).mockResolvedValue(false);

      const result = await AnnouncementService.deleteAnnouncement(mockEnv, 'announcement-123');

      expect(result).toBe(false);
    });
  });
});
