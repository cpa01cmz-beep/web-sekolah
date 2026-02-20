import { Entity } from '../entities/Entity';

const ENTITY_KEY_PREFIX = ':entity:';

function extractEntityIdFromKey(key: string): string | null {
  const idx = key.indexOf(ENTITY_KEY_PREFIX);
  if (idx === -1) return null;
  return key.slice(idx + ENTITY_KEY_PREFIX.length);
}

export class SecondaryIndex<T extends string> extends Entity<unknown> {
  static readonly entityName = "sys-secondary-index";

  constructor(env: Env, entityName: string, fieldName: string) {
    super(env, `secondary-index:${entityName}:${fieldName}`);
  }

  async add(fieldValue: string, entityId: T): Promise<void> {
    const key = `field:${fieldValue}:entity:${entityId}`;
    await this.stub.casPut(key, 0, { entityId });
  }

  async addBatch(items: Array<{ fieldValue: string; entityId: T }>): Promise<void> {
    if (items.length === 0) return;
    await Promise.all(
      items.map(({ fieldValue, entityId }) => {
        const key = `field:${fieldValue}:entity:${entityId}`;
        return this.stub.casPut(key, 0, { entityId });
      })
    );
  }

  async remove(fieldValue: string, entityId: T): Promise<boolean> {
    const key = `field:${fieldValue}:entity:${entityId}`;
    return await this.stub.del(key);
  }

  async removeBatch(items: Array<{ fieldValue: string; entityId: T }>): Promise<number> {
    if (items.length === 0) return 0;
    const results = await Promise.all(
      items.map(({ fieldValue, entityId }) => {
        const key = `field:${fieldValue}:entity:${entityId}`;
        return this.stub.del(key);
      })
    );
    return results.filter(Boolean).length;
  }

  async getByValue(fieldValue: string): Promise<T[]> {
    const prefix = `field:${fieldValue}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    return keys
      .map(key => extractEntityIdFromKey(key))
      .filter((id): id is T => id !== null);
  }

  async countByValue(fieldValue: string): Promise<number> {
    const prefix = `field:${fieldValue}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    return keys.length;
  }

  async existsByValue(fieldValue: string): Promise<boolean> {
    const prefix = `field:${fieldValue}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    return keys.length > 0;
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
