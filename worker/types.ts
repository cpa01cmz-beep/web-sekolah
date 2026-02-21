import { DurableObject } from "cloudflare:workers";

export interface Env {
  GlobalDurableObject: DurableObjectNamespace<GlobalDurableObject>;
  ALLOWED_ORIGINS?: string;
  JWT_SECRET?: string;
  DEFAULT_PASSWORD?: string;
  ENVIRONMENT?: 'development' | 'staging' | 'production';
}

export class GlobalDurableObject extends DurableObject<Env, unknown> {
  private initialized = false;

  constructor(public ctx: DurableObjectState, public env: Env) {
    super(ctx, env);
    
    this.ctx.blockConcurrencyWhile(async () => {
      if (!this.initialized) {
        this.initialized = true;
      }
    });
  }

  async getDoc<T>(key: string): Promise<Doc<T> | null> {
    const value = await this.ctx.storage.get<Doc<T>>(key);
    return value ?? null;
  }

  async casPut<T>(key: string, expectedVersion: number, data: T): Promise<{ ok: boolean; v: number }> {
    const current = await this.ctx.storage.get<Doc<T>>(key);
    const currentVersion = current?.v ?? 0;
    
    if (currentVersion !== expectedVersion) {
      return { ok: false, v: currentVersion };
    }
    
    const newVersion = currentVersion + 1;
    await this.ctx.storage.put(key, { v: newVersion, data });
    return { ok: true, v: newVersion };
  }

  async del(key: string): Promise<boolean> {
    const exists = await this.ctx.storage.get(key);
    if (exists === undefined) {
      return false;
    }
    await this.ctx.storage.delete(key);
    return true;
  }

  async has(key: string): Promise<boolean> {
    const value = await this.ctx.storage.get(key);
    return value !== undefined;
  }

  async listPrefix(prefix: string, cursor: string | null = null, limit?: number): Promise<{ keys: string[]; next: string | null }> {
    const options: { prefix: string; cursor?: string; limit?: number } = { prefix };
    if (cursor) {
      options.cursor = cursor;
    }
    if (limit !== undefined) {
      options.limit = limit;
    }
    
    const result = await this.ctx.storage.list(options);
    const keys = Array.from(result.keys());
    const nextCursor = result.cursor || null;
    
    return { keys, next: nextCursor };
  }

  async indexAddBatch(items: Array<{ key: string; value: string }>): Promise<void> {
    const batch: Record<string, string> = {};
    for (const item of items) {
      batch[item.key] = item.value;
    }
    await this.ctx.storage.put(batch);
  }

  async indexRemoveBatch(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.ctx.storage.delete(key);
    }
  }

  async indexDrop(prefix: string): Promise<void> {
    const list = await this.ctx.storage.list({ prefix });
    for (const key of list.keys()) {
      await this.ctx.storage.delete(key);
    }
  }
}

export type Doc<T> = { v: number; data: T };

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}
