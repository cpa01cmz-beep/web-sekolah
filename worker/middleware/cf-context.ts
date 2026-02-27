import type { Context, Next } from 'hono'

export interface CloudflareContext {
  ip: string
  ray: string | null
  country: string | null
  city: string | null
  timezone: string | null
  requestStartTime: number
}

declare module 'hono' {
  interface ContextVariableMap {
    cfContext: CloudflareContext
  }
}

export function cfContext() {
  return async (c: Context, next: Next) => {
    const requestStartTime = Date.now()

    const cfContext: CloudflareContext = {
      ip:
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-real-ip') ||
        c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
        'unknown',
      ray: c.req.header('cf-ray') || null,
      country: c.req.header('cf-ipcountry') || null,
      city: c.req.header('cf-ipcity') || null,
      timezone: c.req.header('cf-timezone') || null,
      requestStartTime,
    }

    c.set('cfContext', cfContext)

    await next()

    const duration = Date.now() - requestStartTime
    c.header('Server-Timing', `total;dur=${duration}`, { append: true })

    if (cfContext.ray) {
      c.header('X-CF-Ray', cfContext.ray)
    }

    if (cfContext.country) {
      c.header('X-CF-Country', cfContext.country)
    }
  }
}

export function getCfContext(c: Context): CloudflareContext | undefined {
  return c.get('cfContext')
}

export function getClientIp(c: Context): string {
  return c.get('cfContext')?.ip ?? 'unknown'
}
