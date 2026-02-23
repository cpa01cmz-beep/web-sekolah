import { Hono } from 'hono'
import type { Env } from '../core-utils'
import { ok, notFound } from '../core-utils'
import { withErrorHandler } from './route-utils'
import type { Context } from 'hono'
import { strictRateLimiter } from '../middleware/rate-limit'
import { validateQuery } from '../middleware/validation'
import { newsLimitQuerySchema } from '../middleware/schemas'
import { publicCacheWithEdgeCache } from '../middleware/cloudflare-cache'
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
  ensurePublicContentSeeds,
} from '../entities/PublicContentEntity'

import { PaginationDefaults } from '../config'

const SECURITY_TXT = `# Security Policy
# https://securitytxt.org

# Contact: Email address for reporting security vulnerabilities
Contact: security@example.com

# Preferred-Languages: Languages for security reports
Preferred-Languages: en

# Canonical: Canonical URI for this security.txt
Canonical: https://example.com/.well-known/security.txt

# Policy: Link to security policy
Policy: https://example.com/security-policy

# Acknowledgments: Link to acknowledgments page
Acknowledgments: https://example.com/security/acknowledgments

# Hiring: Link to security-related job openings
Hiring: https://example.com/careers#security

# Expires: Expiration date for this file (YYYY-MM-DDTHH:MM:SS.000Z)
Expires: 2027-02-21T00:00:00.000Z
`

export function publicRoutes(app: Hono<{ Bindings: Env }>) {
  app.get(
    '/api/public/security.txt',
    withErrorHandler('get security policy')(async (c: Context) => {
      c.header('Content-Type', 'text/plain; charset=utf-8')
      c.header('Cache-Control', 'public, max-age=86400')
      return c.text(SECURITY_TXT)
    })
  )

  app.get(
    '/api/public/profile',
    publicCacheWithEdgeCache(),
    withErrorHandler('get school profile')(async (c: Context) => {
      const profile = await SchoolProfileEntity.getProfile(c.env)
      if (!profile) {
        return notFound(c, 'School profile not found')
      }
      const { id, ...profileData } = profile
      return ok(c, profileData)
    })
  )

  app.get(
    '/api/public/services',
    publicCacheWithEdgeCache(),
    withErrorHandler('get services')(async (c: Context) => {
      const { items } = await ServiceEntity.list(c.env)
      return ok(c, items)
    })
  )

  app.get(
    '/api/public/achievements',
    publicCacheWithEdgeCache(),
    withErrorHandler('get achievements')(async (c: Context) => {
      const { items } = await AchievementEntity.list(c.env)
      return ok(c, items)
    })
  )

  app.get(
    '/api/public/facilities',
    publicCacheWithEdgeCache(),
    withErrorHandler('get facilities')(async (c: Context) => {
      const { items } = await FacilityEntity.list(c.env)
      return ok(c, items)
    })
  )

  app.get(
    '/api/public/news',
    publicCacheWithEdgeCache(),
    validateQuery(newsLimitQuerySchema),
    withErrorHandler('get news')(async (c: Context) => {
      const validatedQuery = c.get('validatedQuery') as { limit?: number } | undefined
      const limit = validatedQuery?.limit ?? PaginationDefaults.DEFAULT_NEWS_LIMIT
      const items = await NewsEntity.getRecent(c.env, limit)
      return ok(c, items)
    })
  )

  app.get(
    '/api/public/news/:id',
    publicCacheWithEdgeCache(),
    withErrorHandler('get news by id')(async (c: Context) => {
      const id = c.req.param('id')
      const entity = new NewsEntity(c.env, id)
      const news = await entity.getState()
      if (!news || !news.id) {
        return notFound(c, 'News not found')
      }
      return ok(c, news)
    })
  )

  app.get(
    '/api/public/gallery',
    publicCacheWithEdgeCache(),
    withErrorHandler('get gallery')(async (c: Context) => {
      const { items } = await GalleryEntity.list(c.env)
      return ok(c, items)
    })
  )

  app.get(
    '/api/public/work',
    publicCacheWithEdgeCache(),
    withErrorHandler('get works')(async (c: Context) => {
      const { items } = await WorkEntity.list(c.env)
      return ok(c, items)
    })
  )

  app.get(
    '/api/public/links',
    publicCacheWithEdgeCache(),
    withErrorHandler('get links')(async (c: Context) => {
      const { items } = await LinkEntity.list(c.env)
      return ok(c, items)
    })
  )

  app.get(
    '/api/public/downloads',
    publicCacheWithEdgeCache(),
    withErrorHandler('get downloads')(async (c: Context) => {
      const { items } = await DownloadEntity.list(c.env)
      return ok(c, items)
    })
  )

  app.post(
    '/api/public/seed',
    strictRateLimiter(),
    withErrorHandler('seed public content')(async (c: Context) => {
      await ensurePublicContentSeeds(c.env)
      return ok(c, { message: 'Public content seeded successfully' })
    })
  )
}
