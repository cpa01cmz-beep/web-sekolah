import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok } from '../core-utils';
import { ensureAllSeedData } from "../entities";
import { withErrorHandler } from './route-utils';
import type { Context } from 'hono';

export function systemRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/seed', withErrorHandler('seed database')(async (c: Context) => {
    await ensureAllSeedData(c.env);
    return ok(c, { message: 'Database seeded successfully.' });
  }));
}
