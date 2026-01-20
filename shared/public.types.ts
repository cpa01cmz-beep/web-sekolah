export interface SchoolProfile {
  name: string;
  description: string;
  vision: string;
  mission: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image?: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  image?: string;
  capacity?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  date: string;
  author: string;
  category?: string;
  image?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
  category?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  author: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  date: string;
}
