import { Hono } from 'hono'
import type { Env } from '../../core-utils'
import { ok, bad } from '../../core-utils'
import { logger } from '../../logger'
import { CircuitBreaker } from '@shared/CircuitBreaker'
import { withRetry } from '../../resilience/Retry'
import { RetryDelay } from '../../config/time'
import { WEBHOOK_CONFIG } from '../../webhook-constants'
import { RETRY_CONFIG } from '@shared/constants'
import type { Context } from 'hono'
import { withErrorHandler, withAuth } from '../route-utils'
import { isValidWebhookUrl } from '../../middleware/sanitize'

export function webhookTestRoutes(app: Hono<{ Bindings: Env }>) {
  app.post(
    '/api/webhooks/test',
    ...withAuth('admin'),
    withErrorHandler('test webhook')(async (c: Context) => {
      const body = await c.req.json<{
        url: string
        secret: string
      }>()

      if (!body.url || !body.secret) {
        return bad(c, 'Missing required fields: url, secret')
      }

      const urlValidation = isValidWebhookUrl(body.url)
      if (!urlValidation.valid) {
        return bad(c, urlValidation.reason || 'Invalid webhook URL')
      }

      const testPayload = {
        id: `test-${crypto.randomUUID()}`,
        eventType: 'test',
        data: { message: 'Webhook test payload' },
        timestamp: new Date().toISOString(),
      }

      const encoder = new TextEncoder()
      const key = encoder.encode(body.secret)
      const data = encoder.encode(JSON.stringify(testPayload))

      const importedKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signature = await crypto.subtle.sign('HMAC', importedKey, data)
      const hash = new Uint8Array(signature)
      const hexArray = Array.from(hash).map(b => b.toString(16).padStart(2, '0'))
      const signatureHeader = `sha256=${hexArray.join('')}`

      const breaker = CircuitBreaker.createWebhookBreaker(body.url)

      try {
        const responseText = await withRetry(
          async () => {
            const response = await breaker.execute(async () => {
              return await fetch(body.url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Webhook-Signature': signatureHeader,
                  'X-Webhook-ID': testPayload.id,
                  'X-Webhook-Timestamp': testPayload.timestamp,
                  'User-Agent': 'Akademia-Pro-Webhook/1.0',
                },
                body: JSON.stringify(testPayload),
                signal: AbortSignal.timeout(WEBHOOK_CONFIG.REQUEST_TIMEOUT_MS),
              })
            })

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            return await response.text()
          },
          {
            maxRetries: RETRY_CONFIG.DEFAULT_MAX_RETRIES,
            baseDelay: RetryDelay.ONE_SECOND_MS,
            jitterMs: RetryDelay.ONE_SECOND_MS,
            shouldRetry: error => {
              const errorMessage = error instanceof Error ? error.message : String(error)
              return !errorMessage.includes('Circuit breaker is open')
            },
          }
        )

        logger.info('Webhook test sent', { url: body.url, success: true })
        return ok(c, {
          success: true,
          status: 200,
          response: responseText,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (errorMessage.includes('Circuit breaker is open')) {
          logger.warn('Webhook test skipped due to open circuit breaker', {
            url: body.url,
            errorMessage,
          })
          return ok(c, {
            success: false,
            error: 'Circuit breaker is open for this webhook URL. Please wait before retrying.',
          })
        }

        logger.error('Webhook test failed after all retries', errorMessage)
        return ok(c, {
          success: false,
          error: errorMessage,
        })
      }
    })
  )
}
