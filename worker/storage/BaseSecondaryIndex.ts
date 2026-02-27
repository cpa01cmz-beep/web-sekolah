import type { Env } from '../types'
import { Entity } from '../entities/Entity'

const ENTITY_KEY_PREFIX = ':entity:'

export function extractEntityIdFromKey(key: string): string | null {
  const idx = key.indexOf(ENTITY_KEY_PREFIX)
  if (idx === -1) return null
  return key.slice(idx + ENTITY_KEY_PREFIX.length)
}

export abstract class BaseSecondaryIndex extends Entity<unknown> {
  protected abstract readonly keyPrefix: string

  constructor(env: Env, indexKey: string) {
    super(env, indexKey)
  }

  protected abstract buildFieldKey(fieldValues: string[]): string
  protected abstract buildFieldValueKey(fieldValues: string[], entityId: string): string

  async add(fieldValues: string[], entityId: string): Promise<void> {
    const key = this.buildFieldValueKey(fieldValues, entityId)
    await this.stub.casPut(key, 0, { entityId })
  }

  async addBatch(items: Array<{ fieldValues: string[]; entityId: string }>): Promise<void> {
    if (items.length === 0) return
    await Promise.all(
      items.map(({ fieldValues, entityId }) => {
        const key = this.buildFieldValueKey(fieldValues, entityId)
        return this.stub.casPut(key, 0, { entityId })
      })
    )
  }

  async remove(fieldValues: string[], entityId: string): Promise<boolean> {
    const key = this.buildFieldValueKey(fieldValues, entityId)
    return await this.stub.del(key)
  }

  async removeBatch(items: Array<{ fieldValues: string[]; entityId: string }>): Promise<number> {
    if (items.length === 0) return 0
    const results = await Promise.all(
      items.map(({ fieldValues, entityId }) => {
        const key = this.buildFieldValueKey(fieldValues, entityId)
        return this.stub.del(key)
      })
    )
    return results.filter(Boolean).length
  }

  async getByValues(fieldValues: string[]): Promise<string[]> {
    const prefix = this.buildFieldKey(fieldValues)
    const { keys } = await this.stub.listPrefix(prefix)
    return keys.map(key => extractEntityIdFromKey(key)).filter((id): id is string => id !== null)
  }

  async countByValues(fieldValues: string[]): Promise<number> {
    const prefix = this.buildFieldKey(fieldValues)
    const { keys } = await this.stub.listPrefix(prefix)
    return keys.length
  }

  async existsByValues(fieldValues: string[]): Promise<boolean> {
    const prefix = this.buildFieldKey(fieldValues)
    const { keys } = await this.stub.listPrefix(prefix, null, 1)
    return keys.length > 0
  }

  async clearValues(fieldValues: string[]): Promise<void> {
    const prefix = this.buildFieldKey(fieldValues)
    const { keys } = await this.stub.listPrefix(prefix)
    await Promise.all(keys.map((key: string) => this.stub.del(key)))
  }

  async clear(): Promise<void> {
    const { keys } = await this.stub.listPrefix(this.keyPrefix)
    await Promise.all(keys.map((key: string) => this.stub.del(key)))
  }
}
