/**
 * Core utilities for Multiple Entities sharing a single Durable Object class
 * DO NOT MODIFY THIS FILE - You may break the project functionality
 */

// ====================
// Imports
// ====================

import type { ApiResponse } from "@shared/types";
import { DurableObject } from "cloudflare:workers";
import type { Context } from "hono";

// ====================
// Type Definitions
// ====================

export interface Env {
  GlobalDurableObject: DurableObjectNamespace<GlobalDurableObject>;
}

/** 
 * Document type with version for optimistic locking
 * @template T - The type of the data stored in the document
 */
type Doc<T> = { v: number; data: T };

// ====================
// Global Durable Object
// ====================

/**
 * Global Durable object for storage-purpose ONLY, to be used as a KV-like storage by multiple entities
 * This class provides basic CRUD operations with optimistic locking capabilities
 */
export class GlobalDurableObject extends DurableObject<Env, unknown> {
  constructor(public ctx: DurableObjectState, public env: Env) {
    super(ctx, env);
  }

  /**
   * Delete a key from storage
   * @param key - The key to delete
   * @returns true if the key existed and was deleted, false otherwise
   */
  async del(key: string): Promise<boolean> {
    const existed = (await this.ctx.storage.get(key)) !== undefined;
    await this.ctx.storage.delete(key);
    return existed;
  }

  /**
   * Check if a key exists in storage
   * @param key - The key to check
   * @returns true if the key exists, false otherwise
   */
  async has(key: string): Promise<boolean> {
    return (await this.ctx.storage.get(key)) !== undefined;
  }

  /**
   * Get a document from storage
   * @param key - The key of the document to retrieve
   * @returns The document if found, null otherwise
   */
  async getDoc<T>(key: string): Promise<Doc<T> | null> {
    const v = await this.ctx.storage.get<Doc<T>>(key);
    return v ?? null;
  }

  /**
   * Compare-and-swap put operation for optimistic locking
   * @param key - The key to update
   * @param expectedV - The expected version number
   * @param data - The new data to store
   * @returns An object with ok status and the new version number
   */
  async casPut<T>(key: string, expectedV: number, data: T): Promise<{ ok: boolean; v: number }> {
    return this.ctx.storage.transaction(async (txn) => {
      const cur = await txn.get<Doc<T>>(key);
      const curV = cur?.v ?? 0;
      if (curV !== expectedV) return { ok: false, v: curV };
      const nextV = curV + 1;
      await txn.put(key, { v: nextV, data });
      return { ok: true, v: nextV };
    });
  }

  /**
   * List keys with a specified prefix, with optional pagination
   * @param prefix - The prefix to search for
   * @param startAfter - The key to start after (for pagination)
   * @param limit - Maximum number of results to return
   * @returns An object with keys and the next cursor for pagination
   */
  async listPrefix(prefix: string, startAfter?: string | null, limit?: number) {
    const opts: Record<string, unknown> = { prefix };
    if (limit != null) opts.limit = limit;
    if (startAfter)   opts.startAfter = startAfter;
  
    const m = await this.ctx.storage.list(opts);            // Map<string, unknown>
    const names = Array.from((m as Map<string, unknown>).keys());
    // Heuristic: if we got "limit" items, assume there might be more; use the last key as the cursor.
    const next = limit != null && names.length === limit ? names[names.length - 1] : null;
    return { keys: names, next };
  }
  
  /**
   * Add a batch of items to the index transactionally
   * @param items - Array of items to add to the index
   */
  async indexAddBatch<T>(items: T[]): Promise<void> {
    if (items.length === 0) return;
    await this.ctx.storage.transaction(async (txn) => {
      for (const it of items) await txn.put('i:' + String(it), 1);
    });
  }
  
  /**
   * Remove a batch of items from the index transactionally
   * @param items - Array of items to remove from the index
   * @returns The number of items that were actually removed
   */
  async indexRemoveBatch<T>(items: T[]): Promise<number> {
    if (items.length === 0) return 0;
    let removed = 0;
    await this.ctx.storage.transaction(async (txn) => {
      for (const it of items) {
        const k = 'i:' + String(it);
        const existed = (await txn.get(k)) !== undefined;
        await txn.delete(k);
        if (existed) removed++;
      }
    });
    return removed;
  }  

  /**
   * Drop the entire index (delete all entries)
   * @param _rootKey - The root key (currently unused)
   */
  async indexDrop(_rootKey: string): Promise<void> { await this.ctx.storage.deleteAll(); }
}

// ====================
// Entity Types and Base Class
// ====================

export interface EntityStatics<S, T extends Entity<S>> {
  new (env: Env, id: string): T; // inherited default ctor
  readonly entityName: string;
  readonly initialState: S;
}

/**
 * Base class for entities - extend this class to create new entities
 * Provides CRUD operations with optimistic locking and version control
 * @template State - The type of the entity's state
 */
export abstract class Entity<State> {
  /** The current state of the entity */
  protected _state!: State;
  
  /** The version of the entity for optimistic locking */
  protected _version: number = 0;
  
  /** The durable object stub for storage operations */
  protected readonly stub: DurableObjectStub<GlobalDurableObject>;
  
  /** The unique identifier for this entity */
  protected readonly _id: string;
  
  /** The name of the entity type */
  protected readonly entityName: string;
  
  /** The environment context */
  protected readonly env: Env;

  /**
   * Create a new entity instance
   * @param env - The environment context
   * @param id - The unique identifier for this entity
   */
  constructor(env: Env, id: string) {
    this.env = env;
    this._id = id;

    // Read subclass statics via new.target / constructor
    const Ctor = this.constructor as EntityStatics<State, this>;
    this.entityName = Ctor.entityName;

    const instanceName = `${this.entityName}:${this._id}`;
    const doId = env.GlobalDurableObject.idFromName(instanceName);
    this.stub = env.GlobalDurableObject.get(doId);
  }

  /** Synchronous accessors */
  get id(): string {
    return this._id;
  }
  get state(): State {
    return this._state;
  }

  /** 
   * Generate the storage key for this entity document
   * @returns The storage key in the format "entityName:id"
   */
  protected key(): string {
    return `${this.entityName}:${this._id}`;
  }

  /** 
   * Save the entity state with optimistic locking
   * Retries up to 4 times on contention
   * @param next - The new state to save
   * @throws Error if concurrent modification is detected after all retries
   */
  async save(next: State): Promise<void> {
    for (let i = 0; i < 4; i++) {
      await this.ensureState();
      const res = await this.stub.casPut(this.key(), this._version, next);
      if (res.ok) {
        this._version = res.v;
        this._state = next;
        return;
      }
      // retry on contention
    }
    throw new Error("Concurrent modification detected");
  }

  /**
   * Ensure the entity state is loaded from storage
   * @returns The current state of the entity
   */
  protected async ensureState(): Promise<State> {
    const Ctor = this.constructor as EntityStatics<State, this>;
    const doc = (await this.stub.getDoc(this.key())) as Doc<State> | null;
    if (doc == null) {
      this._version = 0;
      this._state = Ctor.initialState;
      return this._state;
    }
    this._version = doc.v;
    this._state = doc.data;
    return this._state;
  }

  /**
   * Mutate the entity state with a function
   * Uses optimistic locking with retry mechanism
   * @param updater - Function that takes the current state and returns the new state
   * @returns The new state after mutation
   * @throws Error if concurrent modification is detected after all retries
   */
  async mutate(updater: (current: State) => State): Promise<State> {
    // Small bounded retry loop for CAS contention
    for (let i = 0; i < 4; i++) {
      const current = await this.ensureState();
      const startV = this._version;
      const next = updater(current);
      // Auto-update timestamps if present
      const withTimestamps = this.applyTimestamps(current, next) as State;
      const res = await this.stub.casPut(this.key(), startV, withTimestamps);
      if (res.ok) {
        this._version = res.v;
        this._state = withTimestamps;
        return withTimestamps;
      }
      // someone else updated; retry
    }
    throw new Error("Concurrent modification detected");
  }

  /**
   * Apply timestamp updates to state if it supports them
   * @param current - Current state
   * @param next - New state
   * @returns State with timestamps applied
   */
  protected applyTimestamps(current: unknown, next: unknown): unknown {
    const state = next as Record<string, unknown>;
    const curr = current as Record<string, unknown>;
    
    // Check if state has timestamp fields
    if ('updatedAt' in state && 'createdAt' in state) {
      const now = new Date().toISOString();
      return {
        ...state,
        updatedAt: now,
        createdAt: state.createdAt || curr.createdAt || now
      };
    }
    return state;
  }

  /**
   * Get the current state of the entity
   * @returns The current state of the entity
   */
  async getState(): Promise<State> {
    return this.ensureState();
  }

  /**
   * Partially update the entity state
   * @param p - Partial state updates to apply
   */
  async patch(p: Partial<State>): Promise<void> {
    await this.mutate((s) => ({ ...s, ...p }));
  }

  /**
   * Check if the entity exists in storage
   * @returns true if the entity exists, false otherwise
   */
  async exists(): Promise<boolean> {
    return this.stub.has(this.key());
  }

  /**
   * Check if the entity is soft deleted
   * @returns true if the entity is marked as deleted
   */
  async isSoftDeleted(): Promise<boolean> {
    const state = await this.ensureState() as Record<string, unknown>;
    return 'deletedAt' in state && state.deletedAt !== null && state.deletedAt !== undefined;
  }

  /**
   * Soft delete the entity by marking as deleted
   * @returns true if the entity existed and was soft deleted, false otherwise
   */
  async softDelete(): Promise<boolean> {
    const state = await this.ensureState() as Record<string, unknown>;
    if ('deletedAt' in state && state.deletedAt !== null && state.deletedAt !== undefined) {
      return false; // Already deleted
    }
    await this.patch({ deletedAt: new Date().toISOString() } as unknown as Partial<State>);
    return true;
  }

  /**
   * Restore a soft-deleted entity
   * @returns true if the entity was restored, false otherwise
   */
  async restore(): Promise<boolean> {
    const state = await this.ensureState() as Record<string, unknown>;
    if (!('deletedAt' in state) || (state.deletedAt === null || state.deletedAt === undefined)) {
      return false; // Not deleted
    }
    await this.patch({ deletedAt: null } as unknown as Partial<State>);
    return true;
  }

  /**
   * Permanently delete the entity from storage
   * @returns true if the entity existed and was deleted, false otherwise
   */
  async delete(): Promise<boolean> {
    const ok = await this.stub.del(this.key());
    if (ok) {
      const Ctor = this.constructor as EntityStatics<State, this>;
      this._version = 0;
      this._state = Ctor.initialState;
    }
    return ok;
  }
}

// ====================
// Index Class
// ====================

/**
 * Minimal prefix-based index held in its own DO instance
 * Used for efficient lookups of entity IDs by providing an indexed list
 * @template T - The type of items to be indexed (constrained to string)
 */
export class Index<T extends string> extends Entity<unknown> {
  static readonly entityName = "sys-index-root";

  /**
   * Create a new index instance
   * @param env - The environment context
   * @param name - The name of the index
   */
  constructor(env: Env, name: string) { 
    super(env, `index:${name}`); 
  }

  /**
   * Add a batch of items to the index transactionally
   * @param itemsToAdd - Array of items to add to the index
   */
  async addBatch(itemsToAdd: T[]): Promise<void> {
    if (itemsToAdd.length === 0) return;
    await this.stub.indexAddBatch(itemsToAdd);
  }

  /**
   * Add a single item to the index
   * @param item - The item to add to the index
   */
  async add(item: T): Promise<void> {
    return this.addBatch([item]);
  }

  /**
   * Remove a single item from the index
   * @param item - The item to remove from the index
   * @returns true if the item existed and was removed, false otherwise
   */
  async remove(item: T): Promise<boolean> {
    const removed = await this.removeBatch([item]);
    return removed > 0;
  }

  /**
   * Remove a batch of items from the index
   * @param itemsToRemove - Array of items to remove from the index
   * @returns The number of items that were actually removed
   */
  async removeBatch(itemsToRemove: T[]): Promise<number> {
    if (itemsToRemove.length === 0) return 0;
    return this.stub.indexRemoveBatch(itemsToRemove);
  }

  /** Clear all entries from the index */
  async clear(): Promise<void> { await this.stub.indexDrop(this.key()); }

  /**
   * Get a paginated list of items from the index
   * @param cursor - The cursor for pagination (optional)
   * @param limit - The maximum number of items to return (optional)
   * @returns An object with items and the next cursor for pagination
   */
  async page(cursor?: string | null, limit?: number): Promise<{ items: T[]; next: string | null }> {
    const { keys, next } = await this.stub.listPrefix('i:', cursor ?? null, limit);
    return { items: keys.map(k => k.slice(2) as T), next };
  }

  /**
   * Get all items from the index
   * @returns An array of all items in the index
   */
  async list(): Promise<T[]> {
    const { keys } = await this.stub.listPrefix('i:');
    return keys.map(k => k.slice(2) as T);
  }
}

// ====================
// Indexed Entity Types and Class
// ====================

type IS<T> = T extends new (env: Env, id: string) => IndexedEntity<infer S> ? S : never;
type HS<TCtor> = TCtor & { indexName: string; keyOf(state: IS<TCtor>): string; seedData?: ReadonlyArray<IS<TCtor>> };
type CtorAny = new (env: Env, id: string) => IndexedEntity<{ id: string }>;

/**
 * Extended Entity class that includes automatic indexing capabilities
 * Provides methods for creating, listing, and managing indexed entities
 * @template S - The state type, which must have an id property
 */
export abstract class IndexedEntity<S extends { id: string }> extends Entity<S> {
  static readonly indexName: string;
  static keyOf<U extends { id: string }>(state: U): string { return state.id; }

  /**
   * Create a new indexed entity and add it to the index
   * @param env - The environment context
   * @param state - The initial state of the entity
   * @returns The created entity state
   */
  static async create<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, state: IS<TCtor>): Promise<IS<TCtor>> {
    const id = this.keyOf(state);
    const inst = new this(env, id);
    const withTimestamps = inst.applyTimestamps({}, state) as IS<TCtor>;
    await inst.save(withTimestamps);
    const idx = new Index<string>(env, this.indexName);
    await idx.add(id);
    return withTimestamps;
  }

  /**
   * List entities with optional pagination
   * @param env - The environment context
   * @param cursor - The cursor for pagination (optional)
   * @param limit - The maximum number of items to return (optional)
   * @param includeDeleted - Whether to include soft-deleted records (default: false)
   * @returns An object with items and the next cursor for pagination
   */
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

  /**
   * Ensure seed data is loaded if the index is empty
   * @param env - The environment context
   */
  static async ensureSeed<TCtor extends CtorAny>(this: HS<TCtor>, env: Env): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    const ids = await idx.list();
    const seeds = this.seedData;
    if (ids.length === 0 && seeds && seeds.length > 0) {
      await Promise.all(seeds.map(s => new this(env, this.keyOf(s)).save(s)));
      await idx.addBatch(seeds.map(s => this.keyOf(s)));
    }
  }

  /**
   * Delete an entity document and remove its ID from the index
   * @param env - The environment context
   * @param id - The ID of the entity to delete
   * @returns true if the entity existed and was deleted, false otherwise
   */
  static async delete<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const existed = await inst.delete();
    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);
    return existed;
  }

  /**
   * Delete multiple entities and remove their IDs from the index
   * @param env - The environment context
   * @param ids - Array of IDs of the entities to delete
   * @returns The number of entities that were actually removed
   */
  static async deleteMany<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const results = await Promise.all(ids.map(async (id) => new this(env, id).delete()));
    const idx = new Index<string>(env, this.indexName);
    await idx.removeBatch(ids);
    return results.filter(Boolean).length;
  }

  /**
   * Remove an entity ID from the index without deleting the entity document
   * @param env - The environment context
   * @param id - The ID to remove from the index
   */
  static async removeFromIndex<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);
  }

  /**
   * Override ensureState to ensure the entity's ID matches its instance ID
   * @returns The current state with a consistent ID
   */
  protected override async ensureState(): Promise<S> {
    const s = (await super.ensureState()) as S;
    if (!s.id) {
      // Ensure the entity state id matches the instance id for consistency
      const withId = { ...s, id: this.id } as S;
      this._state = withId;
      return withId;
    }
    return s;
  }
}

// ====================
// API Helper Functions
// ====================

/** Success response helper */
export const ok = <T>(c: Context, data: T) => c.json({ success: true, data } as ApiResponse<T>);

/** Bad request response helper */
export const bad = (c: Context, error: string) => c.json({ success: false, error } as ApiResponse, 400);

/** Not found response helper */
export const notFound = (c: Context, error = 'not found') => c.json({ success: false, error } as ApiResponse, 404);

/** String type guard helper */
export const isStr = (s: unknown): s is string => typeof s === 'string' && s.length > 0;