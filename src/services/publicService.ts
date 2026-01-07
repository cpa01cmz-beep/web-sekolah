import { apiClient } from '@/lib/api-client';
import type { PublicService } from './serviceContracts';
import type {
  SchoolProfile,
  Service,
  Achievement,
  Facility,
  NewsItem,
  GalleryItem,
  WorkItem,
  LinkItem,
  DownloadItem
} from '@shared/types';

export const publicService: PublicService = {
  async getSchoolProfile(): Promise<SchoolProfile> {
    return apiClient<SchoolProfile>(`/api/public/profile`);
  },

  async getServices(): Promise<Service[]> {
    return apiClient<Service[]>(`/api/public/services`);
  },

  async getAchievements(): Promise<Achievement[]> {
    return apiClient<Achievement[]>(`/api/public/achievements`);
  },

  async getFacilities(): Promise<Facility[]> {
    return apiClient<Facility[]>(`/api/public/facilities`);
  },

  async getNews(limit?: number): Promise<NewsItem[]> {
    const endpoint = limit ? `/api/public/news?limit=${limit}` : `/api/public/news`;
    return apiClient<NewsItem[]>(endpoint);
  },

  async getNewsDetails(id: string): Promise<NewsItem> {
    return apiClient<NewsItem>(`/api/public/news/${id}`);
  },

  async getGallery(): Promise<GalleryItem[]> {
    return apiClient<GalleryItem[]>(`/api/public/gallery`);
  },

  async getWorks(): Promise<WorkItem[]> {
    return apiClient<WorkItem[]>(`/api/public/works`);
  },

  async getLinks(): Promise<LinkItem[]> {
    return apiClient<LinkItem[]>(`/api/public/links`);
  },

  async getDownloads(): Promise<DownloadItem[]> {
    return apiClient<DownloadItem[]>(`/api/public/downloads`);
  }
};
