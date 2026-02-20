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
  continent?: string;
  region?: string;
  httpProtocol?: string;
  tlsVersion?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    cfContext: CloudflareRequestContext;
  }
}

function extractCloudflareContext(c: Context): CloudflareRequestContext {
  const req = c.req.raw;
  const cf = (req as Request<unknown, IncomingRequestCfProperties>).cf;

  return {
    rayId: c.req.header('cf-ray'),
    connectingIp: c.req.header('cf-connecting-ip'),
    country: cf?.country || c.req.header('cf-ipcountry'),
    city: cf?.city,
    timezone: cf?.timezone,
    colo: cf?.colo,
    asn: cf?.asn,
    asOrganization: cf?.asOrganization,
    continent: cf?.continent,
    region: cf?.region,
    httpProtocol: cf?.httpProtocol,
    tlsVersion: cf?.tlsVersion,
    postalCode: cf?.postalCode,
    latitude: cf?.latitude,
    longitude: cf?.longitude,
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
