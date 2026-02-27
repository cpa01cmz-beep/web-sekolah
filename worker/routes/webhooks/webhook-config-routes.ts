import { Hono } from 'hono'
import type { Env } from '../../core-utils'
import { ok, bad, notFound } from '../../core-utils'
import { WebhookConfigEntity } from '../../entities'
import { logger } from '../../logger'
import type { Context } from 'hono'
import { withErrorHandler, withAuth } from '../route-utils'
import { validateBody, validateParams } from '../../middleware/validation'
import {
  createWebhookConfigSchema,
  updateWebhookConfigSchema,
  paramsSchema,
} from '../../middleware/schemas'
import { isValidWebhookUrl } from '../../middleware/sanitize'

export function webhookConfigRoutes(app: Hono<{ Bindings: Env }>) {
  app.get(
    '/api/webhooks',
    ...withAuth('admin'),
    withErrorHandler('list webhooks')(async (c: Context) => {
      const configs = await WebhookConfigEntity.list(c.env)
      const itemsWithoutSecrets = configs.items.map(({ secret: _, ...rest }) => rest)
      return ok(c, itemsWithoutSecrets)
    })
  )

  app.get(
    '/api/webhooks/:id',
    ...withAuth('admin'),
    withErrorHandler('get webhook')(async (c: Context) => {
      const id = c.req.param('id')
      const config = await new WebhookConfigEntity(c.env, id).getState()

      if (!config || config.deletedAt) {
        return notFound(c, 'Webhook configuration not found')
      }

      const { secret: _, ...configWithoutSecret } = config
      return ok(c, configWithoutSecret)
    })
  )

  app.post(
    '/api/webhooks',
    ...withAuth('admin'),
    validateBody(createWebhookConfigSchema),
    withErrorHandler('create webhook')(async (c: Context) => {
      const body = c.get('validatedBody') as {
        url: string
        events: string[]
        secret: string
        active?: boolean
      }

      const urlValidation = isValidWebhookUrl(body.url)
      if (!urlValidation.valid) {
        return bad(c, urlValidation.reason || 'Invalid webhook URL')
      }

      const id = `webhook-${crypto.randomUUID()}`
      const now = new Date().toISOString()

      const config = {
        id,
        url: body.url,
        events: body.events,
        secret: body.secret,
        active: body.active ?? true,
        createdAt: now,
        updatedAt: now,
      }

      await WebhookConfigEntity.create(c.env, config)

      logger.info('Webhook configuration created', { id, url: body.url, events: body.events })

      const { secret: _, ...configWithoutSecret } = config
      return ok(c, configWithoutSecret)
    })
  )

  app.put(
    '/api/webhooks/:id',
    ...withAuth('admin'),
    validateBody(updateWebhookConfigSchema),
    withErrorHandler('update webhook')(async (c: Context) => {
      const id = c.req.param('id')
      const body = c.get('validatedBody') as {
        url?: string
        events?: string[]
        secret?: string
        active?: boolean
      }

      if (body.url) {
        const urlValidation = isValidWebhookUrl(body.url)
        if (!urlValidation.valid) {
          return bad(c, urlValidation.reason || 'Invalid webhook URL')
        }
      }

      const existing = await new WebhookConfigEntity(c.env, id).getState()

      if (!existing || existing.deletedAt) {
        return notFound(c, 'Webhook configuration not found')
      }

      const updated = {
        ...existing,
        url: body.url ?? existing.url,
        events: body.events ?? existing.events,
        secret: body.secret ?? existing.secret,
        active: body.active ?? existing.active,
        updatedAt: new Date().toISOString(),
      }

      const entity = new WebhookConfigEntity(c.env, id)
      await entity.patch(updated)

      logger.info('Webhook configuration updated', { id })

      const { secret: _, ...updatedWithoutSecret } = updated
      return ok(c, updatedWithoutSecret)
    })
  )

  app.delete(
    '/api/webhooks/:id',
    ...withAuth('admin'),
    validateParams(paramsSchema),
    withErrorHandler('delete webhook')(async (c: Context) => {
      const { id } = c.get('validatedParams') as { id: string }
      const existing = await new WebhookConfigEntity(c.env, id).getState()

      if (!existing || existing.deletedAt) {
        return notFound(c, 'Webhook configuration not found')
      }

      await WebhookConfigEntity.delete(c.env, id)

      logger.info('Webhook configuration deleted', { id })

      return ok(c, { id, deleted: true })
    })
  )
}
