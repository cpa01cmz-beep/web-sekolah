import type { Doc } from '../types';

export class GlobalDurableObject extends import('../types').GlobalDurableObject {
  async del(key: string): Promise<boolean> {
    const existed = (await this.ctx.storage.get(key)) !== undefined;
    await this.ctx.storage.delete(key);
    return existed;
  }

  async has(key: string): Promise<boolean> {
    return (await this.ctx.storage.get(key)) !== undefined;
  }

  async getDoc<T>(key: string): Promise<Doc<T> | null> {
    const v = await this.ctx.storage.get<Doc<T>>(key);
    return v ?? null;
  }

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

  async listPrefix(prefix: string, startAfter?: string | null, limit?: number) {
    const opts: Record<string, unknown> = { prefix };
    if (limit != null) opts.limit = limit;
    if (startAfter)   opts.startAfter = startAfter;

    const m = await this.ctx.storage.list(opts);
    const names = Array.from((m as Map<string, unknown>).keys());
    const next = limit != null && names.length === limit ? names[names.length - 1] : null;
    return { keys: names, next };
  }

  async indexAddBatch<T>(items: T[]): Promise<void> {
    if (items.length === 0) return;
    await this.ctx.storage.transaction(async (txn) => {
      for (const it of items) await txn.put('i:' + String(it), 1);
    });
  }

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

  async indexDrop(_rootKey: string): Promise<void> { await this.ctx.storage.deleteAll(); }
}
