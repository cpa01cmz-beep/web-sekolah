import { DurableObject } from 'cloudflare:workers'

export interface Env {
  GlobalDurableObject: DurableObjectNamespace<GlobalDurableObject>
  ALLOWED_ORIGINS?: string
  JWT_SECRET?: string
  DEFAULT_PASSWORD?: string
  ENVIRONMENT?: 'development' | 'staging' | 'production'
}

interface StorageValue {
  v: number
  data: unknown
}

interface IndexEntry {
  entityId: string
}

export class GlobalDurableObject extends DurableObject<Env, unknown> {
  constructor(
    public ctx: DurableObjectState,
    public env: Env
  ) {
    super(ctx, env)
  }

  async getDoc(key: string): Promise<{ v: number; data: unknown } | null> {
    const value = await this.ctx.storage.get<StorageValue>(key)
    return value ?? null
  }

  async casPut(
    key: string,
    expectedVersion: number,
    data: unknown
  ): Promise<{ ok: boolean; v: number }> {
    const storage = this.ctx.storage
    const current = await storage.get<StorageValue>(key)
    const currentVersion = current?.v ?? 0

    if (currentVersion !== expectedVersion) {
      return { ok: false, v: currentVersion }
    }

    const newVersion = currentVersion + 1
    await storage.put(key, { v: newVersion, data })
    return { ok: true, v: newVersion }
  }

  async del(key: string): Promise<boolean> {
    return this.ctx.storage.delete(key)
  }

  async has(key: string): Promise<boolean> {
    const value = await this.ctx.storage.get(key)
    return value !== undefined
  }

  async listPrefix(
    prefix: string,
    cursor?: string | null,
    limit?: number
  ): Promise<{ keys: string[]; next: string | null }> {
    const storage = this.ctx.storage

    const options: { startAfter?: string; prefix: string; limit?: number } = {
      prefix,
    }

    if (cursor) {
      options.startAfter = cursor
    }

    if (limit !== undefined && limit > 0) {
      options.limit = limit + 1
    }

    const result = await storage.list<string>(options)
    const entries = Array.from(result.entries())

    let keys = entries.map(([key]) => key)
    let next: string | null = null

    if (limit !== undefined && limit > 0 && keys.length > limit) {
      next = keys[limit - 1] ?? null
      keys = keys.slice(0, limit)
    }

    return { keys, next }
  }

  async indexAddBatch(items: string[]): Promise<void> {
    const storage = this.ctx.storage
    const batch: Record<string, IndexEntry> = {}

    for (const item of items) {
      batch[`i:${item}`] = { entityId: item }
    }

    await storage.put(batch)
  }

  async indexRemoveBatch(items: string[]): Promise<number> {
    const storage = this.ctx.storage
    const keys = items.map(item => `i:${item}`)
    let totalRemoved = 0

    for (let i = 0; i < keys.length; i += 128) {
      const batch = keys.slice(i, i + 128)
      const removed = await storage.delete(batch)
      totalRemoved += removed
    }

    return totalRemoved
  }

  async indexDrop(prefix: string = 'i:'): Promise<number> {
    const storage = this.ctx.storage
    const existing = await storage.list({ prefix })
    const keys = Array.from(existing.keys())
    let totalRemoved = 0

    for (let i = 0; i < keys.length; i += 128) {
      const batch = keys.slice(i, i + 128)
      const removed = await storage.delete(batch)
      totalRemoved += removed
    }

    return totalRemoved
  }
}

export type Doc<T> = { v: number; data: T }

export interface AuthUser {
  id: string
  email: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
}
