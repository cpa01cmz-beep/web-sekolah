import type { Doc, Env } from '../types';
import { Entity } from '../entities/Entity';

export class DateSortedSecondaryIndex extends Entity<unknown> {
  static readonly entityName = "sys-date-sorted-index";

  constructor(env: Env, entityName: string) {
    super(env, `date-sorted-index:${entityName}`);
  }

  async add(date: string, entityId: string): Promise<void> {
    const timestamp = new Date(date).getTime();
    const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
    const key = `sort:${reversedTimestamp.toString().padStart(20, '0')}:${entityId}`;
    await this.stub.casPut(key, 0, { entityId });
  }

  async remove(date: string, entityId: string): Promise<boolean> {
    const timestamp = new Date(date).getTime();
    const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
    const key = `sort:${reversedTimestamp.toString().padStart(20, '0')}:${entityId}`;
    return await this.stub.del(key);
  }

  async getRecent(limit: number): Promise<string[]> {
    const prefix = `sort:`;
    const { keys } = await this.stub.listPrefix(prefix);
    const sortedKeys = keys.sort();

    const entityIds: string[] = [];
    for (let i = 0; i < Math.min(limit, sortedKeys.length); i++) {
      const key = sortedKeys[i];
      const doc = await this.stub.getDoc(key) as Doc<{ entityId: string }> | null;
      if (doc && doc.data && doc.data.entityId) {
        entityIds.push(doc.data.entityId);
      }
    }
    return entityIds;
  }

  async clear(): Promise<void> {
    const { keys } = await this.stub.listPrefix('sort:');
    await Promise.all(keys.map((key: string) => this.stub.del(key)));
  }
}
