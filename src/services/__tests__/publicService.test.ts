import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPublicService } from '../publicService';
import { MockRepository } from '@/test/utils/mocks';

describe('PublicService', () => {
  let mockRepository: MockRepository;

  beforeEach(() => {
    mockRepository = new MockRepository();
  });

  afterEach(() => {
    mockRepository.reset();
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

      mockRepository.setMockData('/api/public/profile', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getSchoolProfile();

      expect(result).toEqual(mockData);
      expect(result.name).toBe('SMA Harapan Bangsa');
    });

    it('should handle errors when fetching school profile', async () => {
      const mockError = new Error('Failed to fetch profile');
      mockError.name = 'ApiError';
      (mockError as any).status = 500;

      mockRepository.setMockError('/api/public/profile', mockError);
      const publicService = createPublicService(mockRepository);

      await expect(publicService.getSchoolProfile()).rejects.toThrow('Failed to fetch profile');
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

      mockRepository.setMockData('/api/public/services', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getServices();

      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });

    it('should handle empty services list', async () => {
      const mockData: any[] = [];

      mockRepository.setMockData('/api/public/services', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getServices();

      expect(result).toEqual([]);
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

      mockRepository.setMockData('/api/public/achievements', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getAchievements();

      expect(result).toEqual(mockData);
      expect(result[0].title).toBe('National Olympiad Winner');
    });

    it('should handle empty achievements', async () => {
      const mockData: any[] = [];

      mockRepository.setMockData('/api/public/achievements', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getAchievements();

      expect(result).toEqual([]);
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

      mockRepository.setMockData('/api/public/news?limit=5', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getNews(limit);

      expect(result).toEqual(mockData);
    });

    it('should fetch news without limit', async () => {
      const mockData: any[] = [];

      mockRepository.setMockData('/api/public/news', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getNews();

      expect(result).toEqual([]);
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

      mockRepository.setMockData(`/api/public/news/${newsId}`, mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getNewsDetails(newsId);

      expect(result).toEqual(mockData);
      expect(result.title).toBe('School Wins Award');
    });

    it('should handle non-existent news', async () => {
      const newsId = 'non-existent';
      const mockError = new Error('News not found');
      mockError.name = 'ApiError';
      (mockError as any).status = 404;

      mockRepository.setMockError(`/api/public/news/${newsId}`, mockError);
      const publicService = createPublicService(mockRepository);

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

      mockRepository.setMockData('/api/public/gallery', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getGallery();

      expect(result).toEqual(mockData);
    });

    it('should handle empty gallery', async () => {
      const mockData: any[] = [];

      mockRepository.setMockData('/api/public/gallery', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getGallery();

      expect(result).toEqual([]);
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

      mockRepository.setMockData('/api/public/work', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getWorks();

      expect(result).toEqual(mockData);
    });

    it('should handle empty works list', async () => {
      const mockData: any[] = [];

      mockRepository.setMockData('/api/public/work', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getWorks();

      expect(result).toEqual([]);
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

      mockRepository.setMockData('/api/public/links', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getLinks();

      expect(result).toEqual(mockData);
      expect(result[0].url).toBe('https://school.example.com');
    });

    it('should handle empty links list', async () => {
      const mockData: any[] = [];

      mockRepository.setMockData('/api/public/links', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getLinks();

      expect(result).toEqual([]);
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

      mockRepository.setMockData('/api/public/downloads', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getDownloads();

      expect(result).toEqual(mockData);
      expect(result[0].title).toBe('School Calendar 2025');
    });

    it('should handle empty downloads list', async () => {
      const mockData: any[] = [];

      mockRepository.setMockData('/api/public/downloads', mockData);
      const publicService = createPublicService(mockRepository);

      const result = await publicService.getDownloads();

      expect(result).toEqual([]);
    });
  });
});
