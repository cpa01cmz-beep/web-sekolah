import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok } from '../core-utils';
import { ensureAllSeedData } from "../entities";

export function systemRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/seed', async (c) => {
    await ensureAllSeedData(c.env);
    return ok(c, { message: 'Database seeded successfully.' });
  });
}
