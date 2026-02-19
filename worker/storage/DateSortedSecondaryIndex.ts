import type { Env } from '../types';
import { Entity } from '../entities/Entity';

function safeTimestamp(date: string): number {
  const timestamp = new Date(date).getTime();
  if (isNaN(timestamp)) {
    throw new Error(`Invalid date format: ${date}`);
  }
  return timestamp;
}

function extractEntityIdFromKey(key: string): string | null {
  const lastColon = key.lastIndexOf(':');
  if (lastColon === -1) return null;
  return key.slice(lastColon + 1);
}

export class DateSortedSecondaryIndex extends Entity<unknown> {
  static readonly entityName = "sys-date-sorted-index";

  constructor(env: Env, entityName: string) {
    super(env, `date-sorted-index:${entityName}`);
  }

  async add(date: string, entityId: string): Promise<void> {
    const timestamp = safeTimestamp(date);
    const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
    const key = `sort:${reversedTimestamp.toString().padStart(20, '0')}:${entityId}`;
    await this.stub.casPut(key, 0, { entityId });
  }

  async remove(date: string, entityId: string): Promise<boolean> {
    const timestamp = safeTimestamp(date);
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
      const entityId = extractEntityIdFromKey(sortedKeys[i]);
      if (entityId !== null) {
        entityIds.push(entityId);
      }
    }
    return entityIds;
  }

  async getAll(): Promise<string[]> {
    const prefix = `sort:`;
    const { keys } = await this.stub.listPrefix(prefix);
    const sortedKeys = keys.sort();

    return sortedKeys
      .map(key => extractEntityIdFromKey(key))
      .filter((id): id is string => id !== null);
  }

  async count(): Promise<number> {
    const { keys } = await this.stub.listPrefix('sort:');
    return keys.length;
  }

  async clear(): Promise<void> {
    const { keys } = await this.stub.listPrefix('sort:');
    await Promise.all(keys.map((key: string) => this.stub.del(key)));
  }
}
