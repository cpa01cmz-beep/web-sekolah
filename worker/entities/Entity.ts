import type { Doc, Env, GlobalDurableObject } from '../types';

export interface EntityStatics<S, T extends Entity<S>> {
  new (env: Env, id: string): T;
  readonly entityName: string;
  readonly initialState: S;
}

export abstract class Entity<State> {
  protected _state!: State;
  protected _version: number = 0;
  protected readonly stub: DurableObjectStub<GlobalDurableObject>;
  protected readonly _id: string;
  protected readonly entityName: string;
  protected readonly env: Env;

  constructor(env: Env, id: string) {
    this.env = env;
    this._id = id;

    const Ctor = this.constructor as EntityStatics<State, this>;
    this.entityName = Ctor.entityName;

    const instanceName = `${this.entityName}:${this._id}`;
    const doId = env.GlobalDurableObject.idFromName(instanceName);
    this.stub = env.GlobalDurableObject.get(doId);
  }

  get id(): string {
    return this._id;
  }
  get state(): State {
    return this._state;
  }

  protected key(): string {
    return `${this.entityName}:${this._id}`;
  }

  async save(next: State): Promise<void> {
    for (let i = 0; i < 4; i++) {
      await this.ensureState();
      const res = await this.stub.casPut(this.key(), this._version, next);
      if (res.ok) {
        this._version = res.v;
        this._state = next;
        return;
      }
    }
    throw new Error("Concurrent modification detected");
  }

  protected async ensureState(): Promise<State> {
    const Ctor = this.constructor as EntityStatics<State, this>;
    const doc = (await this.stub.getDoc(this.key())) as Doc<State> | null;
    if (doc == null) {
      this._version = 0;
      this._state = Ctor.initialState;
      return this._state;
    }
    this._version = doc.v;
    this._state = doc.data;
    return this._state;
  }

  async mutate(updater: (current: State) => State): Promise<State> {
    for (let i = 0; i < 4; i++) {
      const current = await this.ensureState();
      const startV = this._version;
      const next = updater(current);
      const withTimestamps = this.applyTimestamps(current, next) as State;
      const res = await this.stub.casPut(this.key(), startV, withTimestamps);
      if (res.ok) {
        this._version = res.v;
        this._state = withTimestamps;
        return withTimestamps;
      }
    }
    throw new Error("Concurrent modification detected");
  }

  protected applyTimestamps(current: unknown, next: unknown): unknown {
    const state = next as Record<string, unknown>;
    const curr = current as Record<string, unknown>;

    if ('updatedAt' in state && 'createdAt' in state) {
      const now = new Date().toISOString();
      return {
        ...state,
        updatedAt: now,
        createdAt: state.createdAt || curr.createdAt || now
      };
    }
    return state;
  }

  async getState(): Promise<State> {
    return this.ensureState();
  }

  async patch(p: Partial<State>): Promise<void> {
    await this.mutate((s) => ({ ...s, ...p }));
  }

  async exists(): Promise<boolean> {
    return this.stub.has(this.key());
  }

  async isSoftDeleted(): Promise<boolean> {
    const state = await this.ensureState() as Record<string, unknown>;
    return 'deletedAt' in state && state.deletedAt !== null && state.deletedAt !== undefined;
  }

  async softDelete(): Promise<boolean> {
    const state = await this.ensureState() as Record<string, unknown>;
    if ('deletedAt' in state && state.deletedAt !== null && state.deletedAt !== undefined) {
      return false;
    }
    await this.patch({ deletedAt: new Date().toISOString() } as unknown as Partial<State>);
    return true;
  }

  async restore(): Promise<boolean> {
    const state = await this.ensureState() as Record<string, unknown>;
    if (!('deletedAt' in state) || (state.deletedAt === null || state.deletedAt === undefined)) {
      return false;
    }
    await this.patch({ deletedAt: null } as unknown as Partial<State>);
    return true;
  }

  async delete(): Promise<boolean> {
    const ok = await this.stub.del(this.key());
    if (ok) {
      const Ctor = this.constructor as EntityStatics<State, this>;
      this._version = 0;
      this._state = Ctor.initialState;
    }
    return ok;
  }
}
