// Mock for cloudflare:workers module for test environment

export interface DurableObjectState {
  waitUntil(promise: Promise<unknown>): void
  storage: DurableObjectStorage
}

export interface DurableObjectStorage {
  get<T = unknown>(key: string, options?: { allowConcurrency?: boolean }): Promise<T | undefined>
  get<T = unknown>(
    keys: string[],
    options?: { allowConcurrency?: boolean }
  ): Promise<Map<string, T>>
  put<T>(
    key: string,
    value: T,
    options?: { allowUnconfirmed?: boolean; allowConcurrency?: boolean }
  ): Promise<void>
  put<T>(
    entries: Record<string, T>,
    options?: { allowUnconfirmed?: boolean; allowConcurrency?: boolean }
  ): Promise<void>
  delete(key: string, options?: { allowUnconfirmed?: boolean }): Promise<boolean>
  delete(keys: string[], options?: { allowUnconfirmed?: boolean }): Promise<number>
  deleteAll(options?: { allowUnconfirmed?: boolean }): Promise<void>
  transaction<T>(closure: (txn: DurableObjectTransaction) => Promise<T>): Promise<T>
  list<T = unknown>(options?: {
    prefix?: string
    limit?: number
  }): Promise<{ keys: string[]; list_complete: boolean; cursor?: string }>
}

export interface DurableObjectTransaction {
  rollback(): Promise<void>
  get<T = unknown>(key: string): Promise<T | undefined>
  put<T = unknown>(key: string, value: T): Promise<void>
  delete(key: string): Promise<boolean>
}

export interface DurableObjectNamespace<T> {
  idFromName(name: string): DurableObjectId
  idFromString(str: string): DurableObjectId
  get(id: DurableObjectId): DurableObjectStub
}

export interface DurableObjectId {
  toString(): string
}

export class MockDurableObjectId implements DurableObjectId {
  private readonly id: string
  constructor(id: string) {
    this.id = id
  }
  toString(): string {
    return this.id
  }
}

export interface DurableObjectStub {
  get(): Promise<DurableObjectState>
  getDoc<T>(key: string): Promise<VersionedDoc & { data: T }>
  casPut(key: string, expectedVersion: number, value: unknown): Promise<CasResult>
  del(key: string): Promise<boolean>
  has(key: string): boolean
  listPrefix<T>(prefix: string, limit?: number): Promise<T[]>
}

export class MockDurableObjectNamespace implements DurableObjectNamespace<unknown> {
  idFromName(name: string): DurableObjectId {
    return new MockDurableObjectId(name)
  }
  idFromString(str: string): DurableObjectId {
    return new MockDurableObjectId(str)
  }
  get(id: DurableObjectId): DurableObjectStub {
    return new MockDurableObjectStub(id.toString())
  }
}

export class MockDurableObjectStub implements DurableObjectStub {
  private readonly id: string
  constructor(id: string) {
    this.id = id
  }
  async get(): Promise<DurableObjectState> {
    return {
      waitUntil: () => {},
      storage: new MockDurableObjectStorage(),
    } as DurableObjectState
  }
  async getDoc<T>(_key: string): Promise<VersionedDoc & { data: T }> {
    return { v: 1, data: {} as T }
  }
  async casPut(): Promise<CasResult> {
    return { ok: true, v: 1 }
  }
  async del(): Promise<boolean> {
    return true
  }
  has(): boolean {
    return false
  }
  async listPrefix<T>(): Promise<T[]> {
    return []
  }
}

export class MockDurableObjectStorage implements DurableObjectStorage {
  private store = new Map<string, unknown>()
  async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined
  }
  async get<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>()
    for (const key of keys) {
      const value = this.store.get(key)
      if (value !== undefined) {
        result.set(key, value as T)
      }
    }
    return result
  }
  async put<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value)
  }
  async put<T>(entries: Record<string, T>): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      this.store.set(key, value)
    }
  }
  async delete(key: string): Promise<boolean> {
    return this.store.delete(key)
  }
  async delete(keys: string[]): Promise<number> {
    let count = 0
    for (const key of keys) {
      if (this.store.delete(key)) count++
    }
    return count
  }
  async deleteAll(): Promise<void> {
    this.store.clear()
  }
  async transaction<T>(_closure: (txn: DurableObjectTransaction) => Promise<T>): Promise<T> {
    return {} as T
  }
  async list<T = unknown>(_options?: {
    prefix?: string
    limit?: number
  }): Promise<{ keys: string[]; list_complete: boolean; cursor?: string }> {
    return { keys: [], list_complete: true }
  }
}

export interface VersionedDoc {
  v: number
}

export interface CasResult {
  ok: boolean
  v: number
}

export class DurableObject {
  constructor(
    public ctx: DurableObjectState,
    public env: unknown
  ) {}
}

export const ENV = {
  USERS: new MockDurableObjectNamespace(),
  CLASSES: new MockDurableObjectNamespace(),
  COURSES: new MockDurableObjectNamespace(),
  ANNOUNCEMENTS: new MockDurableObjectNamespace(),
  GRADES: new MockDurableObjectNamespace(),
  ATTENDANCE: new MockDurableObjectNamespace(),
  MESSAGES: new MockDurableObjectNamespace(),
  PARENTS: new MockDurableObjectNamespace(),
  STUDENTS: new MockDurableObjectNamespace(),
  TEACHERS: new MockDurableObjectNamespace(),
  WEBHOOKS: new MockDurableObjectNamespace(),
  DEAD_LETTER_QUEUE: new MockDurableObjectNamespace(),
  ANALYTICS: new MockDurableObjectNamespace(),
}
