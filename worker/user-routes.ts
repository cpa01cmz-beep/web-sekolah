import { Hono } from "hono";
import type { Env } from './core-utils';
import { studentRoutes, teacherRoutes, adminRoutes, userManagementRoutes, parentRoutes, systemRoutes, healthRoutes } from './routes';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  healthRoutes(app);
  systemRoutes(app);
  studentRoutes(app);
  teacherRoutes(app);
  adminRoutes(app);
  parentRoutes(app);
  userManagementRoutes(app);
}
