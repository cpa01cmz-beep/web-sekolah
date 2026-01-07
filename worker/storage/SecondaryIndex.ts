import type { Doc } from '../types';
import { Entity } from '../entities/Entity';

export class SecondaryIndex<T extends string> extends Entity<unknown> {
  static readonly entityName = "sys-secondary-index";

  constructor(env: Env, entityName: string, fieldName: string) {
    super(env, `secondary-index:${entityName}:${fieldName}`);
  }

  async add(fieldValue: string, entityId: T): Promise<void> {
    const key = `field:${fieldValue}:entity:${entityId}`;
    await this.stub.casPut(key, 0, { entityId });
  }

  async remove(fieldValue: string, entityId: T): Promise<boolean> {
    const key = `field:${fieldValue}:entity:${entityId}`;
    return await this.stub.del(key);
  }

  async getByValue(fieldValue: string): Promise<T[]> {
    const prefix = `field:${fieldValue}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    const entityIds: T[] = [];
    for (const key of keys) {
      const doc = await this.stub.getDoc(key) as Doc<{ entityId: T }> | null;
      if (doc && doc.data && doc.data.entityId) {
        entityIds.push(doc.data.entityId);
      }
    }
    return entityIds;
  }

  async clearValue(fieldValue: string): Promise<void> {
    const prefix = `field:${fieldValue}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    await Promise.all(keys.map((key) => this.stub.del(key)));
  }

  async clear(): Promise<void> {
    const { keys } = await this.stub.listPrefix('field:');
    await Promise.all(keys.map((key) => this.stub.del(key)));
  }
}
