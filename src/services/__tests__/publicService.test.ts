import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { publicService } from '../publicService';
import type { ApiResponse } from '@shared/types';

describe('PublicService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSchoolProfile', () => {
    it('should fetch school profile', async () => {
      const mockData = {
        name: 'SMA Harapan Bangsa',
        description: 'School of excellence',
        vision: 'To be the best',
        mission: 'Provide quality education',
        address: '123 Main St',
        phone: '+62-123-4567',
        email: 'info@school.com',
        principalName: 'Dr. Smith',
      };
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getSchoolProfile();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/profile', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getServices', () => {
    it('should fetch school services', async () => {
      const mockData = [
        {
          id: 'service-01',
          name: 'Library',
          description: 'Complete library with thousands of books',
          icon: 'book',
        },
        {
          id: 'service-02',
          name: 'Sports',
          description: 'Various sports facilities',
          icon: 'trophy',
        },
      ];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getServices();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/services', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getAchievements', () => {
    it('should fetch school achievements', async () => {
      const mockData = [
        {
          id: 'ach-01',
          title: 'National Olympiad Winner',
          description: 'First place in Math Olympiad 2024',
          date: '2024-12-15',
          category: 'Academic',
          image: 'https://example.com/award.jpg',
        },
      ];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getAchievements();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/achievements', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getNews', () => {
    it('should fetch news with limit', async () => {
      const limit = 5;
      const mockData = [
        {
          id: 'news-01',
          title: 'School Wins Award',
          content: 'Our school won the...',
          date: '2025-01-07',
          author: 'Admin',
          category: 'Events',
        },
      ];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getNews(limit);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/news?limit=5', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should fetch news without limit', async () => {
      const mockData: any[] = [];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getNews();

      expect(result).toEqual(mockData);
    });
  });

  describe('getNewsDetails', () => {
    it('should fetch news details by ID', async () => {
      const newsId = 'news-01';
      const mockData = {
        id: 'news-01',
        title: 'School Wins Award',
        content: 'Full news content here...',
        date: '2025-01-07',
        author: 'Admin',
        category: 'Events',
        image: 'https://example.com/news.jpg',
      };
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getNewsDetails(newsId);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/news/news-01', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle non-existent news', async () => {
      const newsId = 'non-existent';
      const mockResponse: ApiResponse<unknown> = {
        success: false,
        error: 'News not found',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await expect(publicService.getNewsDetails(newsId)).rejects.toThrow('News not found');
    });
  });

  describe('getGallery', () => {
    it('should fetch gallery items', async () => {
      const mockData = [
        {
          id: 'gallery-01',
          title: 'School Event',
          description: 'Annual sports day',
          imageUrl: 'https://example.com/image.jpg',
          date: '2025-01-07',
          category: 'Events',
        },
      ];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getGallery();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/gallery', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getWorks', () => {
    it('should fetch works/activities', async () => {
      const mockData = [
        {
          id: 'work-01',
          title: 'Science Project',
          description: 'Award-winning project',
          imageUrl: 'https://example.com/project.jpg',
          date: '2025-01-07',
          author: 'Student Team',
        },
      ];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getWorks();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/works', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getLinks', () => {
    it('should fetch useful links', async () => {
      const mockData = [
        {
          id: 'link-01',
          title: 'Official Website',
          url: 'https://school.example.com',
          description: 'Main school website',
          category: 'Resources',
        },
      ];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getLinks();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/links', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('getDownloads', () => {
    it('should fetch downloadable files', async () => {
      const mockData = [
        {
          id: 'download-01',
          title: 'School Calendar 2025',
          description: 'Annual calendar PDF',
          fileUrl: 'https://example.com/calendar.pdf',
          fileSize: '2.5 MB',
          fileType: 'PDF',
          date: '2025-01-01',
        },
      ];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await publicService.getDownloads();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/public/downloads', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
});
