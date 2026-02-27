import { IndexedEntity, type Env } from '../core-utils'
import type {
  SchoolProfile,
  Service,
  Achievement,
  Facility,
  NewsItem,
  GalleryItem,
  WorkItem,
  LinkItem,
  DownloadItem,
} from '@shared/types'
import { DateSortedSecondaryIndex } from '../storage/DateSortedSecondaryIndex'
import { publicSeedData } from './public-seed-data'

const now = new Date().toISOString()

export class SchoolProfileEntity extends IndexedEntity<SchoolProfile & { id: string }> {
  static readonly entityName = 'school-profile'
  static readonly indexName = 'school-profiles'
  static readonly initialState = {
    id: 'default',
    name: '',
    description: '',
    vision: '',
    mission: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
  }
  static seedData = publicSeedData.schoolProfile

  static async getProfile(env: Env): Promise<(SchoolProfile & { id: string }) | null> {
    const entity = new this(env, 'default')
    const state = await entity.getState()
    if (!state.name) return null
    return state
  }
}

export class ServiceEntity extends IndexedEntity<Service> {
  static readonly entityName = 'service'
  static readonly indexName = 'services'
  static readonly initialState = { id: '', name: '', description: '', icon: '' }
  static seedData = publicSeedData.services
}

export class AchievementEntity extends IndexedEntity<Achievement> {
  static readonly entityName = 'achievement'
  static readonly indexName = 'achievements'
  static readonly initialState = {
    id: '',
    title: '',
    description: '',
    date: '',
    category: '',
    image: '',
  }
  static seedData = publicSeedData.achievements
}

export class FacilityEntity extends IndexedEntity<Facility> {
  static readonly entityName = 'facility'
  static readonly indexName = 'facilities'
  static readonly initialState = { id: '', name: '', description: '', image: '', capacity: 0 }
  static seedData = publicSeedData.facilities
}

export class NewsEntity extends IndexedEntity<NewsItem> {
  static readonly entityName = 'news'
  static readonly indexName = 'news'
  static readonly initialState = {
    id: '',
    title: '',
    content: '',
    excerpt: '',
    date: '',
    author: '',
    category: '',
    image: '',
  }
  static seedData = publicSeedData.news

  static async getRecent(env: Env, limit: number): Promise<NewsItem[]> {
    const index = new DateSortedSecondaryIndex(env, this.entityName)
    const recentIds = await index.getRecent(limit)
    if (recentIds.length === 0) {
      const { items } = await this.list(env)
      return items.slice(0, limit)
    }
    const newsItems = await Promise.all(recentIds.map(id => new this(env, id).getState()))
    return newsItems.filter(n => n && n.id) as NewsItem[]
  }
}

export class GalleryEntity extends IndexedEntity<GalleryItem> {
  static readonly entityName = 'gallery'
  static readonly indexName = 'gallery'
  static readonly initialState = {
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    category: '',
  }
  static seedData = publicSeedData.gallery
}

export class WorkEntity extends IndexedEntity<WorkItem> {
  static readonly entityName = 'work'
  static readonly indexName = 'works'
  static readonly initialState = {
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    author: '',
  }
  static seedData = publicSeedData.works
}

export class LinkEntity extends IndexedEntity<LinkItem> {
  static readonly entityName = 'link'
  static readonly indexName = 'links'
  static readonly initialState = { id: '', title: '', url: '', description: '', category: '' }
  static seedData = publicSeedData.links
}

export class DownloadEntity extends IndexedEntity<DownloadItem> {
  static readonly entityName = 'download'
  static readonly indexName = 'downloads'
  static readonly initialState = {
    id: '',
    title: '',
    description: '',
    fileUrl: '',
    fileSize: '',
    fileType: '',
    date: '',
  }
  static seedData = publicSeedData.downloads
}

export async function ensurePublicContentSeeds(env: Env): Promise<void> {
  await SchoolProfileEntity.ensureSeed(env)
  await ServiceEntity.ensureSeed(env)
  await AchievementEntity.ensureSeed(env)
  await FacilityEntity.ensureSeed(env)
  await NewsEntity.ensureSeed(env)
  await GalleryEntity.ensureSeed(env)
  await WorkEntity.ensureSeed(env)
  await LinkEntity.ensureSeed(env)
  await DownloadEntity.ensureSeed(env)
}
