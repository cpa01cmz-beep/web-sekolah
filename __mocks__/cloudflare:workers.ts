// Mock for cloudflare:workers module for test environment

export interface DurableObjectState {
  waitUntil(promise: Promise<unknown>): void;
  storage: DurableObjectStorage;
}

export interface DurableObjectStorage {
  get(key: string): Promise<any>;
  put(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: string[]; list_complete: boolean; cursor?: string }>;
  transaction(): DurableObjectTransaction;
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
}

export class DurableObject {
  constructor(public ctx: DurableObjectState, public env: unknown) {}
}
