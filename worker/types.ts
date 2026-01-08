import { DurableObject } from "cloudflare:workers";

export interface Env {
  GlobalDurableObject: DurableObjectNamespace<GlobalDurableObject>;
  ALLOWED_ORIGINS?: string;
  JWT_SECRET?: string;
  ENVIRONMENT?: 'development' | 'staging' | 'production';
}

export class GlobalDurableObject extends DurableObject<Env, unknown> {
  constructor(public ctx: DurableObjectState, public env: Env) {
    super(ctx, env);
  }
}

export type Doc<T> = { v: number; data: T };
