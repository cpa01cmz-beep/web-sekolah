import { Entity } from '../entities/Entity'

export class Index<T extends string> extends Entity<unknown> {
  static readonly entityName = 'sys-index-root'

  constructor(env: Env, name: string) {
    super(env, `index:${name}`)
  }

  async addBatch(itemsToAdd: T[]): Promise<void> {
    if (itemsToAdd.length === 0) return
    await this.stub.indexAddBatch(itemsToAdd)
  }

  async add(item: T): Promise<void> {
    return this.addBatch([item])
  }

  async remove(item: T): Promise<boolean> {
    const removed = await this.removeBatch([item])
    return removed > 0
  }

  async removeBatch(itemsToRemove: T[]): Promise<number> {
    if (itemsToRemove.length === 0) return 0
    return this.stub.indexRemoveBatch(itemsToRemove)
  }

  async clear(): Promise<void> {
    await this.stub.indexDrop(this.key())
  }

  async page(cursor?: string | null, limit?: number): Promise<{ items: T[]; next: string | null }> {
    const { keys, next } = await this.stub.listPrefix('i:', cursor ?? null, limit)
    return { items: keys.map(k => k.slice(2) as T), next }
  }

  async list(): Promise<T[]> {
    const { keys } = await this.stub.listPrefix('i:')
    return keys.map(k => k.slice(2) as T)
  }

  async count(): Promise<number> {
    const { keys } = await this.stub.listPrefix('i:')
    return keys.length
  }
}
