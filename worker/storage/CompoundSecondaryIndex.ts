import type { Env } from '../types';
import { Entity } from '../entities/Entity';

const ENTITY_KEY_PREFIX = ':entity:';

function extractEntityIdFromKey(key: string): string | null {
  const idx = key.indexOf(ENTITY_KEY_PREFIX);
  if (idx === -1) return null;
  return key.slice(idx + ENTITY_KEY_PREFIX.length);
}

export class CompoundSecondaryIndex extends Entity<unknown> {
  static readonly entityName = "sys-compound-secondary-index";

  constructor(env: Env, entityName: string, fieldNames: string[]) {
    const joinedFields = fieldNames.join(':');
    super(env, `compound-index:${entityName}:${joinedFields}`);
  }

  async add(fieldValues: string[], entityId: string): Promise<void> {
    const joinedKey = fieldValues.join(':');
    const key = `compound:${joinedKey}:entity:${entityId}`;
    await this.stub.casPut(key, 0, { entityId });
  }

  async remove(fieldValues: string[], entityId: string): Promise<boolean> {
    const joinedKey = fieldValues.join(':');
    const key = `compound:${joinedKey}:entity:${entityId}`;
    return await this.stub.del(key);
  }

  async getByValues(fieldValues: string[]): Promise<string[]> {
    const joinedKey = fieldValues.join(':');
    const prefix = `compound:${joinedKey}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    return keys
      .map(key => extractEntityIdFromKey(key))
      .filter((id): id is string => id !== null);
  }

  async countByValues(fieldValues: string[]): Promise<number> {
    const joinedKey = fieldValues.join(':');
    const prefix = `compound:${joinedKey}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    return keys.length;
  }

  async existsByValues(fieldValues: string[]): Promise<boolean> {
    const joinedKey = fieldValues.join(':');
    const prefix = `compound:${joinedKey}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    return keys.length > 0;
  }

  async clearValues(fieldValues: string[]): Promise<void> {
    const joinedKey = fieldValues.join(':');
    const prefix = `compound:${joinedKey}:entity:`;
    const { keys } = await this.stub.listPrefix(prefix);
    await Promise.all(keys.map((key: string) => this.stub.del(key)));
  }

  async clear(): Promise<void> {
    const { keys } = await this.stub.listPrefix('compound:');
    await Promise.all(keys.map((key: string) => this.stub.del(key)));
  }
}
