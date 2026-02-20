import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cfContext, getCloudflareContext } from '../cf-context';

describe('cf-context middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  it('should extract Cloudflare headers from request', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => {
      const ctx = getCloudflareContext(c);
      return c.json({ ctx });
    });

    const res = await app.request('/api/test', {
      headers: {
        'cf-ray': 'abc123',
        'cf-connecting-ip': '1.2.3.4',
        'cf-ipcountry': 'US',
      },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ctx.rayId).toBe('abc123');
    expect(body.ctx.connectingIp).toBe('1.2.3.4');
    expect(body.ctx.country).toBe('US');
  });

  it('should handle missing Cloudflare headers gracefully', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => {
      const ctx = getCloudflareContext(c);
      return c.json({ ctx });
    });

    const res = await app.request('/api/test');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ctx.rayId).toBeUndefined();
    expect(body.ctx.connectingIp).toBeUndefined();
  });

  it('should set CF-Ray response header if present', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test', {
      headers: { 'cf-ray': 'xyz789' },
    });

    expect(res.headers.get('CF-Ray')).toBe('xyz789');
  });

  it('should not set CF-Ray header if not present', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => c.json({ success: true }));

    const res = await app.request('/api/test');
    expect(res.headers.get('CF-Ray')).toBeNull();
  });

  it('should return undefined when context not set', async () => {
    app.get('/api/test', (c) => {
      const ctx = getCloudflareContext(c);
      return c.json({ ctx });
    });

    const res = await app.request('/api/test');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ctx).toBeUndefined();
  });

  it('should extract additional Cloudflare properties from cf object', async () => {
    app.use('/api/*', cfContext());
    app.get('/api/test', (c) => {
      const ctx = getCloudflareContext(c);
      return c.json({ ctx });
    });

    const mockRequest = new Request('http://localhost/api/test', {
      headers: {
        'cf-ray': 'test-ray',
        'cf-connecting-ip': '5.6.7.8',
      },
    });

    Object.defineProperty(mockRequest, 'cf', {
      value: {
        country: 'GB',
        city: 'London',
        timezone: 'Europe/London',
        colo: 'LHR',
        asn: 12345,
        asOrganization: 'Test ISP',
        continent: 'EU',
        region: 'England',
        httpProtocol: 'HTTP/2',
        tlsVersion: 'TLSv1.3',
        postalCode: 'SW1A',
        latitude: '51.5074',
        longitude: '-0.1278',
      },
      writable: false,
    });

    const res = await app.request(mockRequest as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ctx.country).toBe('GB');
    expect(body.ctx.city).toBe('London');
    expect(body.ctx.timezone).toBe('Europe/London');
    expect(body.ctx.colo).toBe('LHR');
    expect(body.ctx.asn).toBe(12345);
    expect(body.ctx.asOrganization).toBe('Test ISP');
    expect(body.ctx.continent).toBe('EU');
    expect(body.ctx.region).toBe('England');
    expect(body.ctx.httpProtocol).toBe('HTTP/2');
    expect(body.ctx.tlsVersion).toBe('TLSv1.3');
    expect(body.ctx.postalCode).toBe('SW1A');
    expect(body.ctx.latitude).toBe('51.5074');
    expect(body.ctx.longitude).toBe('-0.1278');
  });
});
