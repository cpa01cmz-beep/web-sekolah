import type { Context, Next } from 'hono';

interface CloudflareRequestContext {
  rayId?: string;
  connectingIp?: string;
  country?: string;
  city?: string;
  timezone?: string;
  colo?: string;
  asn?: number;
  asOrganization?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    cfContext: CloudflareRequestContext;
  }
}

function extractCloudflareContext(c: Context): CloudflareRequestContext {
  const req = c.req.raw;
  const cf = (req as any).cf as Record<string, unknown> | undefined;

  return {
    rayId: c.req.header('cf-ray'),
    connectingIp: c.req.header('cf-connecting-ip'),
    country: cf?.country as string | undefined || c.req.header('cf-ipcountry'),
    city: cf?.city as string | undefined,
    timezone: cf?.timezone as string | undefined,
    colo: cf?.colo as string | undefined,
    asn: cf?.asn as number | undefined,
    asOrganization: cf?.asOrganization as string | undefined,
  };
}

export function cfContext() {
  return async (c: Context, next: Next) => {
    const cfCtx = extractCloudflareContext(c);
    c.set('cfContext', cfCtx);
    
    if (cfCtx.rayId) {
      c.header('CF-Ray', cfCtx.rayId);
    }
    
    await next();
  };
}

export function getCloudflareContext(c: Context): CloudflareRequestContext | undefined {
  return c.get('cfContext');
}

export type { CloudflareRequestContext };
