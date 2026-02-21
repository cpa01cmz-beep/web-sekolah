import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, notFound } from '../core-utils';
import { withErrorHandler } from './route-utils';
import type { Context } from 'hono';
import { strictRateLimiter } from '../middleware/rate-limit';
import { 
  SchoolProfileEntity, 
  ServiceEntity, 
  AchievementEntity, 
  FacilityEntity, 
  NewsEntity, 
  GalleryEntity, 
  WorkEntity, 
  LinkEntity, 
  DownloadEntity,
  ensurePublicContentSeeds 
} from '../entities/PublicContentEntity';

import { PaginationDefaults } from '../config';

export function publicRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/public/profile', withErrorHandler('get school profile')(async (c: Context) => {
    const profile = await SchoolProfileEntity.getProfile(c.env);
    if (!profile) {
      return notFound(c, 'School profile not found');
    }
    const { id, ...profileData } = profile;
    return ok(c, profileData);
  }));

  app.get('/api/public/services', withErrorHandler('get services')(async (c: Context) => {
    const { items } = await ServiceEntity.list(c.env);
    return ok(c, items);
  }));

  app.get('/api/public/achievements', withErrorHandler('get achievements')(async (c: Context) => {
    const { items } = await AchievementEntity.list(c.env);
    return ok(c, items);
  }));

  app.get('/api/public/facilities', withErrorHandler('get facilities')(async (c: Context) => {
    const { items } = await FacilityEntity.list(c.env);
    return ok(c, items);
  }));

  app.get('/api/public/news', withErrorHandler('get news')(async (c: Context) => {
    const limitParam = c.req.query('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : PaginationDefaults.DEFAULT_NEWS_LIMIT;
    const { items } = await NewsEntity.list(c.env, undefined, limit);
    return ok(c, items);
  }));

  app.get('/api/public/news/:id', withErrorHandler('get news by id')(async (c: Context) => {
    const id = c.req.param('id');
    const entity = new NewsEntity(c.env, id);
    const news = await entity.getState();
    if (!news || !news.id) {
      return notFound(c, 'News not found');
    }
    return ok(c, news);
  }));

  app.get('/api/public/gallery', withErrorHandler('get gallery')(async (c: Context) => {
    const { items } = await GalleryEntity.list(c.env);
    return ok(c, items);
  }));

  app.get('/api/public/work', withErrorHandler('get works')(async (c: Context) => {
    const { items } = await WorkEntity.list(c.env);
    return ok(c, items);
  }));

  app.get('/api/public/links', withErrorHandler('get links')(async (c: Context) => {
    const { items } = await LinkEntity.list(c.env);
    return ok(c, items);
  }));

  app.get('/api/public/downloads', withErrorHandler('get downloads')(async (c: Context) => {
    const { items } = await DownloadEntity.list(c.env);
    return ok(c, items);
  }));

  app.post('/api/public/seed', strictRateLimiter(), withErrorHandler('seed public content')(async (c: Context) => {
    await ensurePublicContentSeeds(c.env);
    return ok(c, { message: 'Public content seeded successfully' });
  }));
}
