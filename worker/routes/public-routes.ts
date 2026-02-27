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

const DEFAULT_SITE_URL = 'https://example.com'

function buildSecurityTxt(siteUrl: string): string {
  return `# Security Policy
# https://securitytxt.org

# Contact: Email address for reporting security vulnerabilities
Contact: security@${new URL(siteUrl).hostname}

# Preferred-Languages: Languages for security reports
Preferred-Languages: en

# Canonical: Canonical URI for this security.txt
Canonical: ${siteUrl}/.well-known/security.txt

# Policy: Link to security policy
Policy: ${siteUrl}/security-policy

# Acknowledgments: Link to acknowledgments page
Acknowledgments: ${siteUrl}/security/acknowledgments

# Hiring: Link to security-related job openings
Hiring: ${siteUrl}/careers#security

# Expires: Expiration date for this file (YYYY-MM-DDTHH:MM:SS.000Z)
Expires: 2027-02-21T00:00:00.000Z
`
}

function buildRobotsTxt(siteUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
}

export function publicRoutes(app: Hono<{ Bindings: Env }>) {
  app.get(
    '/api/public/.well-known/security.txt',
    withErrorHandler('get security policy (well-known)')(async (c: Context) => {
      const siteUrl = c.env.SITE_URL || DEFAULT_SITE_URL
      c.header('Content-Type', 'text/plain; charset=utf-8')
      c.header('Cache-Control', 'public, max-age=86400')
      return c.text(buildSecurityTxt(siteUrl))
    })
  )

  app.get(
    '/api/public/security.txt',
    withErrorHandler('get security policy')(async (c: Context) => {
      const siteUrl = c.env.SITE_URL || DEFAULT_SITE_URL
      c.header('Content-Type', 'text/plain; charset=utf-8')
      c.header('Cache-Control', 'public, max-age=86400')
      return c.text(buildSecurityTxt(siteUrl))
    })
  )

  app.get(
    '/api/public/robots.txt',
    withErrorHandler('get robots.txt')(async (c: Context) => {
      const siteUrl = c.env.SITE_URL || DEFAULT_SITE_URL
      c.header('Content-Type', 'text/plain; charset=utf-8')
      c.header('Cache-Control', 'public, max-age=86400')
      return c.text(buildRobotsTxt(siteUrl))
    })
  )

  app.get(
    '/api/public/sitemap.xml',
    publicCacheWithEdgeCache(),
    withErrorHandler('get sitemap')(async (c: Context) => {
      const siteUrl = c.env.SITE_URL || DEFAULT_SITE_URL
      const baseUrl = new URL(siteUrl).origin

      const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/about', priority: '0.8', changefreq: 'monthly' },
        { loc: '/contact', priority: '0.8', changefreq: 'monthly' },
        { loc: '/services', priority: '0.7', changefreq: 'weekly' },
        { loc: '/achievements', priority: '0.7', changefreq: 'weekly' },
        { loc: '/facilities', priority: '0.7', changefreq: 'weekly' },
        { loc: '/news', priority: '0.9', changefreq: 'daily' },
        { loc: '/gallery', priority: '0.6', changefreq: 'weekly' },
        { loc: '/work', priority: '0.6', changefreq: 'weekly' },
        { loc: '/downloads', priority: '0.5', changefreq: 'monthly' },
      ]

      const news = await NewsEntity.getRecent(c.env, 50)
      const newsUrls = news.map(item => ({
        loc: `/news/${item.id}`,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: item.updatedAt || item.createdAt,
      }))

      const allUrls = [...staticPages, ...newsUrls]
      const today = new Date().toISOString().split('T')[0]

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    page => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `    <lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`

      c.header('Content-Type', 'application/xml; charset=utf-8')
      c.header('Cache-Control', 'public, max-age=86400')
      return c.text(sitemap)
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
