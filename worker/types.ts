import { DurableObject } from "cloudflare:workers";

export interface Env {
  GlobalDurableObject: DurableObjectNamespace<GlobalDurableObject>;
  ALLOWED_ORIGINS?: string;
  JWT_SECRET?: string;
  DEFAULT_PASSWORD?: string;
  ENVIRONMENT?: 'development' | 'staging' | 'production';
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
}

export class GlobalDurableObject extends DurableObject<Env, unknown> {
  constructor(public ctx: DurableObjectState, public env: Env) {
    super(ctx, env);
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

  async has(key: string): Promise<boolean> {
    return this.ctx.storage.get(key) !== undefined;
  }

  async del(key: string): Promise<boolean> {
    const exists = await this.has(key);
    if (exists) {
      await this.ctx.storage.delete(key);
      return true;
    }
    return false;
  }

  async listPrefix(prefix: string, cursor: string | null = null, limit?: number): Promise<{ keys: string[]; next: string | null }> {
    const options: { prefix: string; cursor?: string; limit?: number } = { prefix };
    if (cursor) options.cursor = cursor;
    if (limit) options.limit = limit;
    
    const result = await this.ctx.storage.list(options);
    const keys: string[] = [];
    for (const key of result.keys()) {
      keys.push(key as string);
    }
    
    const nextCursor = 'cursor' in result && typeof result.cursor === 'string' && result.cursor.length > 0
      ? result.cursor
      : null;
    
    return { keys, next: nextCursor };
  }

  async indexAddBatch<T extends string>(items: T[]): Promise<void> {
    const updates: Record<string, unknown> = {};
    for (const item of items) {
      updates[`i:${item}`] = true;
    }
    await this.ctx.storage.put(updates);
  }

  async indexRemoveBatch<T extends string>(items: T[]): Promise<number> {
    let removed = 0;
    for (const item of items) {
      const key = `i:${item}`;
      if (await this.ctx.storage.get(key) !== undefined) {
        await this.ctx.storage.delete(key);
        removed++;
      }
    }
    return removed;
  }

  async indexDrop(key: string): Promise<void> {
    const listResult = await this.ctx.storage.list({ prefix: `${key}:i:` });
    for (const k of listResult.keys()) {
      await this.ctx.storage.delete(k);
    }
  }
}

export type Doc<T> = { v: number; data: T };

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}
