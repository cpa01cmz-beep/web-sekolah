import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { Announcement } from "@shared/types";
import { seedData } from "../seed-data";
import { DateSortedSecondaryIndex } from "../storage/DateSortedSecondaryIndex";

export class AnnouncementEntity extends IndexedEntity<Announcement> {
  static readonly entityName = "announcement";
  static readonly indexName = "announcements";
  static readonly initialState: Announcement = { id: "", title: "", content: "", date: "", authorId: "", targetRole: "all", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.announcements;

  static readonly secondaryIndexes = [
    { fieldName: 'authorId', getValue: (state: { id: string; }) => (state as Announcement).authorId },
    { fieldName: 'targetRole', getValue: (state: { id: string; }) => (state as Announcement).targetRole }
  ];

  static async getByAuthorId(env: Env, authorId: string): Promise<Announcement[]> {
    return this.getBySecondaryIndex(env, 'authorId', authorId);
  }

  static async getByTargetRole(env: Env, targetRole: string): Promise<Announcement[]> {
    const [specificRoleAnnouncements, allAnnouncements] = await Promise.all([
      this.getBySecondaryIndex(env, 'targetRole', targetRole),
      this.getBySecondaryIndex(env, 'targetRole', 'all')
    ]);
    return [...specificRoleAnnouncements, ...allAnnouncements];
  }

  static async getRecentByTargetRole(env: Env, targetRole: string, limit: number): Promise<Announcement[]> {
    const [specificRoleAnnouncements, allAnnouncements] = await Promise.all([
      this.getBySecondaryIndex(env, 'targetRole', targetRole),
      this.getBySecondaryIndex(env, 'targetRole', 'all')
    ]);
    
    const merged = [...specificRoleAnnouncements, ...allAnnouncements];
    const seen = new Set<string>();
    const unique = merged.filter(ann => {
      if (seen.has(ann.id)) return false;
      seen.add(ann.id);
      return true;
    });
    
    const sorted = unique.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sorted.slice(0, limit);
  }

  static async getRecent(env: Env, limit: number): Promise<Announcement[]> {
    const index = new DateSortedSecondaryIndex(env, this.entityName);
    const recentIds = await index.getRecent(limit);
    if (recentIds.length === 0) {
      return [];
    }
    const announcements = await Promise.all(recentIds.map(id => new this(env, id).getState()));
    return announcements.filter(a => a && !a.deletedAt) as Announcement[];
  }

  static async countByAuthorId(env: Env, authorId: string): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'authorId');
    return await index.countByValue(authorId);
  }

  static async existsByAuthorId(env: Env, authorId: string): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'authorId', authorId);
  }

  static async countByTargetRole(env: Env, targetRole: string): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'targetRole');
    return await index.countByValue(targetRole);
  }

  static async existsByTargetRole(env: Env, targetRole: string): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'targetRole', targetRole);
  }

  static async createWithDateIndex(env: Env, state: Announcement): Promise<Announcement> {
    const created = await super.create(env, state);
    const dateIndex = new DateSortedSecondaryIndex(env, this.entityName);
    await dateIndex.add(state.date, state.id);
    return created;
  }

  static async deleteWithDateIndex(env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const state = await inst.getState() as Announcement | null;
    if (!state) return false;

    const dateIndex = new DateSortedSecondaryIndex(env, this.entityName);
    await dateIndex.remove(state.date, id);
    return await super.delete(env, id);
  }
}
