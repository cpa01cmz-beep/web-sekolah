import type { Env } from '../types'
import { Entity } from '../entities/Entity'

export function safeTimestamp(date: string): number {
  const timestamp = new Date(date).getTime()
  if (isNaN(timestamp)) {
    throw new Error(`Invalid date format: ${date}`)
  }
  return timestamp
}

export function extractEntityIdFromKey(key: string): string | null {
  const lastColon = key.lastIndexOf(':')
  if (lastColon === -1) return null
  return key.slice(lastColon + 1)
}

export function buildSortKey(timestamp: number, entityId: string): string {
  const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp
  return `sort:${reversedTimestamp.toString().padStart(20, '0')}:${entityId}`
}

const SORT_PREFIX = 'sort:'

export abstract class BaseDateSortedIndex extends Entity<unknown> {
  protected constructor(env: Env, indexKey: string) {
    super(env, indexKey)
  }

  async add(date: string, entityId: string): Promise<void> {
    const timestamp = safeTimestamp(date)
    const key = buildSortKey(timestamp, entityId)
    await this.stub.casPut(key, 0, { entityId })
  }

  async addBatch(items: Array<{ date: string; entityId: string }>): Promise<void> {
    if (items.length === 0) return
    await Promise.all(
      items.map(({ date, entityId }) => {
        const timestamp = safeTimestamp(date)
        const key = buildSortKey(timestamp, entityId)
        return this.stub.casPut(key, 0, { entityId })
      })
    )
  }

  async remove(date: string, entityId: string): Promise<boolean> {
    const timestamp = safeTimestamp(date)
    const key = buildSortKey(timestamp, entityId)
    return await this.stub.del(key)
  }

  async removeBatch(items: Array<{ date: string; entityId: string }>): Promise<number> {
    if (items.length === 0) return 0
    const results = await Promise.all(
      items.map(({ date, entityId }) => {
        const timestamp = safeTimestamp(date)
        const key = buildSortKey(timestamp, entityId)
        return this.stub.del(key)
      })
    )
    return results.filter(Boolean).length
  }

  async getRecent(limit: number): Promise<string[]> {
    const { keys } = await this.stub.listPrefix(SORT_PREFIX)
    const sortedKeys = keys.sort()

    const entityIds: string[] = []
    for (let i = 0; i < Math.min(limit, sortedKeys.length); i++) {
      const entityId = extractEntityIdFromKey(sortedKeys[i])
      if (entityId !== null) {
        entityIds.push(entityId)
      }
    }
    return entityIds
  }

  async getAll(): Promise<string[]> {
    const { keys } = await this.stub.listPrefix(SORT_PREFIX)
    const sortedKeys = keys.sort()

    return sortedKeys
      .map(key => extractEntityIdFromKey(key))
      .filter((id): id is string => id !== null)
  }

  async count(): Promise<number> {
    const { keys } = await this.stub.listPrefix(SORT_PREFIX)
    return keys.length
  }

  async clear(): Promise<void> {
    const { keys } = await this.stub.listPrefix(SORT_PREFIX)
    await Promise.all(keys.map((key: string) => this.stub.del(key)))
  }
}
