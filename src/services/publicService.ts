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
import { API_ENDPOINTS } from '@/config/api-endpoints';

export function createPublicService(repository: IRepository = apiRepository): PublicService {
  return {
    async getSchoolProfile(): Promise<SchoolProfile> {
      return repository.get<SchoolProfile>(API_ENDPOINTS.PUBLIC.PROFILE);
    },

    async getServices(): Promise<Service[]> {
      return repository.get<Service[]>(API_ENDPOINTS.PUBLIC.SERVICES);
    },

    async getAchievements(): Promise<Achievement[]> {
      return repository.get<Achievement[]>(API_ENDPOINTS.PUBLIC.ACHIEVEMENTS);
    },

    async getFacilities(): Promise<Facility[]> {
      return repository.get<Facility[]>(API_ENDPOINTS.PUBLIC.FACILITIES);
    },

    async getNews(limit?: number): Promise<NewsItem[]> {
      const endpoint = limit ? `${API_ENDPOINTS.PUBLIC.NEWS}?limit=${limit}` : API_ENDPOINTS.PUBLIC.NEWS;
      return repository.get<NewsItem[]>(endpoint);
    },

    async getNewsDetails(id: string): Promise<NewsItem> {
      return repository.get<NewsItem>(API_ENDPOINTS.PUBLIC.NEWS_DETAIL(id));
    },

    async getGallery(): Promise<GalleryItem[]> {
      return repository.get<GalleryItem[]>(API_ENDPOINTS.PUBLIC.GALLERY);
    },

    async getWorks(): Promise<WorkItem[]> {
      return repository.get<WorkItem[]>(API_ENDPOINTS.PUBLIC.WORKS);
    },

    async getLinks(): Promise<LinkItem[]> {
      return repository.get<LinkItem[]>(API_ENDPOINTS.PUBLIC.LINKS);
    },

    async getDownloads(): Promise<DownloadItem[]> {
      return repository.get<DownloadItem[]>(API_ENDPOINTS.PUBLIC.DOWNLOADS);
    }
  };
}

export const publicService = createPublicService();
