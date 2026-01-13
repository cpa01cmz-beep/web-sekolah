// Mock for cloudflare:workers module for test environment

export interface DurableObjectState {
  waitUntil(promise: Promise<unknown>): void;
  storage: DurableObjectStorage;
}

export interface DurableObjectStorage {
  get<T = unknown>(
    key: string,
    options?: { allowConcurrency?: boolean }
  ): Promise<T | undefined>;
  get<T = unknown>(
    keys: string[],
    options?: { allowConcurrency?: boolean }
  ): Promise<Map<string, T>>;
  put<T>(
    key: string,
    value: T,
    options?: { allowUnconfirmed?: boolean; allowConcurrency?: boolean }
  ): Promise<void>;
  put<T>(
    entries: Record<string, T>,
    options?: { allowUnconfirmed?: boolean; allowConcurrency?: boolean }
  ): Promise<void>;
  delete(key: string, options?: { allowUnconfirmed?: boolean }): Promise<boolean>;
  delete(keys: string[], options?: { allowUnconfirmed?: boolean }): Promise<number>;
  deleteAll(options?: { allowUnconfirmed?: boolean }): Promise<void>;
  transaction<T>(
    closure: (txn: DurableObjectTransaction) => Promise<T>
  ): Promise<T>;
  list<T = unknown>(
    options?: { prefix?: string; limit?: number }
  ): Promise<{ keys: string[]; list_complete: boolean; cursor?: string }>;
}

export interface DurableObjectTransaction {
  rollback(): Promise<void>;
  get(key: string): Promise<any>;
  put(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface DurableObjectNamespace<T> {
  idFromName(name: string): DurableObjectId;
  idFromString(str: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub;
}

export interface DurableObjectId {
  toString(): string;
}

export interface DurableObjectStub {
  get(): Promise<DurableObjectState>;
  getDoc<T>(key: string): Promise<VersionedDoc & { data: T }>;
  casPut(key: string, expectedVersion: number, value: unknown): Promise<CasResult>;
  del(key: string): Promise<boolean>;
  has(key: string): boolean;
  listPrefix<T>(prefix: string, limit?: number): Promise<T[]>;
}

export interface VersionedDoc {
  v: number;
}

export interface CasResult {
  ok: boolean;
  v: number;
}

export class DurableObject {
  constructor(public ctx: DurableObjectState, public env: unknown) {}
}
