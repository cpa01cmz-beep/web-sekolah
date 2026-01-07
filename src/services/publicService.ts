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
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';

export function createPublicService(repository: IRepository = apiRepository): PublicService {
  return {
    async getSchoolProfile(): Promise<SchoolProfile> {
      return repository.get<SchoolProfile>(`/api/public/profile`);
    },

    async getServices(): Promise<Service[]> {
      return repository.get<Service[]>(`/api/public/services`);
    },

    async getAchievements(): Promise<Achievement[]> {
      return repository.get<Achievement[]>(`/api/public/achievements`);
    },

    async getFacilities(): Promise<Facility[]> {
      return repository.get<Facility[]>(`/api/public/facilities`);
    },

    async getNews(limit?: number): Promise<NewsItem[]> {
      const endpoint = limit ? `/api/public/news?limit=${limit}` : `/api/public/news`;
      return repository.get<NewsItem[]>(endpoint);
    },

    async getNewsDetails(id: string): Promise<NewsItem> {
      return repository.get<NewsItem>(`/api/public/news/${id}`);
    },

    async getGallery(): Promise<GalleryItem[]> {
      return repository.get<GalleryItem[]>(`/api/public/gallery`);
    },

    async getWorks(): Promise<WorkItem[]> {
      return repository.get<WorkItem[]>(`/api/public/work`);
    },

    async getLinks(): Promise<LinkItem[]> {
      return repository.get<LinkItem[]>(`/api/public/links`);
    },

    async getDownloads(): Promise<DownloadItem[]> {
      return repository.get<DownloadItem[]>(`/api/public/downloads`);
    }
  };
}

export const publicService = createPublicService();
