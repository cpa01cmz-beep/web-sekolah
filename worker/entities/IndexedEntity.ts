import { Entity, EntityStatics } from './Entity';
import { Index } from '../storage/Index';
import { SecondaryIndex } from '../storage/SecondaryIndex';
import type { Env } from '../types';

type IS<T> = T extends new (env: Env, id: string) => IndexedEntity<infer S> ? S : never;
type HS<TCtor> = TCtor & { indexName: string; keyOf(state: IS<TCtor>): string; seedData?: ReadonlyArray<IS<TCtor>>; secondaryIndexes?: SecondaryIndexConfig[] };
type CtorAny = new (env: Env, id: string) => IndexedEntity<{ id: string }>;

interface SecondaryIndexConfig {
  fieldName: string;
  getValue: (state: IS<CtorAny>) => string;
}

export abstract class IndexedEntity<S extends { id: string }> extends Entity<S> {
  static readonly indexName: string;
  static keyOf<U extends { id: string }>(state: U): string { return state.id; }

  static async create<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, state: IS<TCtor>): Promise<IS<TCtor>> {
    const id = this.keyOf(state);
    const inst = new this(env, id);
    const withTimestamps = inst.applyTimestamps({}, state) as IS<TCtor>;
    await inst.save(withTimestamps);
    const idx = new Index<string>(env, this.indexName);
    await idx.add(id);

    const secondaryIndexes = this.secondaryIndexes;
    if (secondaryIndexes) {
      const entityName = inst.entityName;
      for (const config of secondaryIndexes) {
        const idx = new SecondaryIndex<string>(env, entityName, config.fieldName as string);
        const fieldValue = config.getValue(withTimestamps);
        await idx.add(fieldValue, id);
      }
    }

    return withTimestamps;
  }

  static async list<TCtor extends CtorAny>(
    this: HS<TCtor>,
    env: Env,
    cursor?: string | null,
    limit?: number,
    includeDeleted = false
  ): Promise<{ items: IS<TCtor>[]; next: string | null }> {
    const idx = new Index<string>(env, this.indexName);
    const { items: ids, next } = await idx.page(cursor, limit);
    const rows = (await Promise.all(ids.map((id) => new this(env, id).getState()))) as IS<TCtor>[];
    
    if (!includeDeleted) {
      const filtered = rows.filter((row) => {
        const r = row as Record<string, unknown>;
        return !('deletedAt' in r) || r.deletedAt === null || r.deletedAt === undefined;
      });
      return { items: filtered, next };
    }
    
    return { items: rows, next };
  }

  static async ensureSeed<TCtor extends CtorAny>(this: HS<TCtor>, env: Env): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    const ids = await idx.list();
    const seeds = this.seedData;
    if (ids.length === 0 && seeds && seeds.length > 0) {
      await Promise.all(seeds.map(s => new this(env, this.keyOf(s)).save(s)));
      await idx.addBatch(seeds.map(s => this.keyOf(s)));
    }
  }

  static async softDeleteWithIndexCleanup<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const state = await inst.getState();

    const softDeleted = await inst.softDelete();
    if (!softDeleted) return false;

    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);

    const secondaryIndexes = this.secondaryIndexes;
    if (secondaryIndexes) {
      const entityName = inst.entityName;
      for (const config of secondaryIndexes) {
        const idx = new SecondaryIndex<string>(env, entityName, config.fieldName as string);
        const fieldValue = config.getValue(state);
        await idx.remove(fieldValue, id);
      }
    }

    return true;
  }

  static async restoreWithIndexCleanup<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const state = await inst.getState();

    const restored = await inst.restore();
    if (!restored) return false;

    const idx = new Index<string>(env, this.indexName);
    await idx.add(id);

    const secondaryIndexes = this.secondaryIndexes;
    if (secondaryIndexes) {
      const entityName = inst.entityName;
      for (const config of secondaryIndexes) {
        const idx = new SecondaryIndex<string>(env, entityName, config.fieldName as string);
        const fieldValue = config.getValue(state);
        await idx.add(fieldValue, id);
      }
    }

    return true;
  }

  static async delete<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const state = await inst.getState();
    const existed = await inst.delete();
    if (!existed) return false;

    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);

    const secondaryIndexes = this.secondaryIndexes;
    if (secondaryIndexes) {
      const entityName = inst.entityName;
      for (const config of secondaryIndexes) {
        const idx = new SecondaryIndex<string>(env, entityName, config.fieldName as string);
        const fieldValue = config.getValue(state);
        await idx.remove(fieldValue, id);
      }
    }

    return existed;
  }

  static async deleteMany<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const results = await Promise.all(ids.map(async (id) => new this(env, id).delete()));
    const idx = new Index<string>(env, this.indexName);
    await idx.removeBatch(ids);
    return results.filter(Boolean).length;
  }

  static async removeFromIndex<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);
  }

  static async count<TCtor extends CtorAny>(this: HS<TCtor>, env: Env): Promise<number> {
    const idx = new Index<string>(env, this.indexName);
    return await idx.count();
  }

  static async countBySecondaryIndex<TCtor extends CtorAny>(
    this: HS<TCtor>,
    env: Env,
    fieldName: string,
    value: string
  ): Promise<number> {
    const inst = new this(env, 'dummy');
    const entityName = inst.entityName;
    const idx = new SecondaryIndex<string>(env, entityName, fieldName);
    return await idx.countByValue(value);
  }

  static async getBySecondaryIndex<TCtor extends CtorAny>(
    this: HS<TCtor>,
    env: Env,
    fieldName: string,
    value: string,
    includeDeleted = false
  ): Promise<IS<TCtor>[]> {
    const inst = new this(env, 'dummy');
    const entityName = inst.entityName;
    const idx = new SecondaryIndex<string>(env, entityName, fieldName);
    const entityIds = await idx.getByValue(value);
    const entities = await Promise.all(
      entityIds.map(async (id) => {
        try {
          return await new this(env, id).getState();
        } catch {
          return null;
        }
      })
    );

    const nonNullEntities = entities.filter((e): e is IS<TCtor> => e !== null);

    if (!includeDeleted) {
      return nonNullEntities.filter((row) => {
        const r = row as Record<string, unknown>;
        return !('deletedAt' in r) || r.deletedAt === null || r.deletedAt === undefined;
      });
    }

    return nonNullEntities;
  }

  protected override async ensureState(): Promise<S> {
    const s = (await super.ensureState()) as S;
    if (!s.id) {
      const withId = { ...s, id: this.id } as S;
      this._state = withId;
      return withId;
    }
    return s;
  }
}
