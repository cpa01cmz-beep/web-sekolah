import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { securityHeaders } from '../security-headers';

describe('Security Headers Middleware', () => {
  it('should add all default security headers', async () => {
    const app = new Hono();
    app.use('*', securityHeaders());
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains; preload');
    expect(res.headers.get('Content-Security-Policy')).toBeDefined();
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('Permissions-Policy')).toBeDefined();
    expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(res.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
    expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(res.headers.get('Cross-Origin-Resource-Policy')).toBe('same-site');
  });

  it('should use default CSP directives with hash-based script-src', async () => {
    const app = new Hono();
    app.use('*', securityHeaders());
    app.get('/', (c) => c.text('Hello'));

    const res = await app.request('/');
    const csp = res.headers.get('Content-Security-Policy');

    expect(csp).toBeDefined();
    expect(csp).toContain("script-src 'self' 'sha256-1LjDIY7ayXpv8ODYzP8xZXqNvuMhUBdo39lNMQ1oGHI=' 'unsafe-eval'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('should include report-uri for CSP violation monitoring', async () => {
    const app = new Hono();
    app.use('*', securityHeaders());
    app.get('/', (c) => c.text('Hello'));

    const res = await app.request('/');
    const csp = res.headers.get('Content-Security-Policy');

    expect(csp).toBeDefined();
    expect(csp).toContain("report-uri /api/csp-report");
  });

  it('should allow HSTS configuration to be disabled', async () => {
    const app = new Hono();
    app.use('*', securityHeaders({ enableHSTS: false }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Strict-Transport-Security')).toBeNull();
  });

  it('should allow CSP to be disabled', async () => {
    const app = new Hono();
    app.use('*', securityHeaders({ enableCSP: false }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Security-Policy')).toBeNull();
  });

  it('should allow custom CSP directives', async () => {
    const app = new Hono();
    const customCSP = "default-src 'self'; script-src 'self';";
    app.use('*', securityHeaders({ cspDirectives: customCSP }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Security-Policy')).toBe(customCSP);
  });

  it('should allow custom HSTS max age', async () => {
    const app = new Hono();
    app.use('*', securityHeaders({ hstsMaxAge: 86400 }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Strict-Transport-Security')).toBe('max-age=86400; includeSubDomains; preload');
  });

  it('should allow X-Frame-Options to be disabled', async () => {
    const app = new Hono();
    app.use('*', securityHeaders({ enableXFrameOptions: false }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Frame-Options')).toBeNull();
  });

  it('should allow X-Content-Type-Options to be disabled', async () => {
    const app = new Hono();
    app.use('*', securityHeaders({ enableXContentTypeOptions: false }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Content-Type-Options')).toBeNull();
  });

  it('should allow Referrer-Policy to be disabled', async () => {
    const app = new Hono();
    app.use('*', securityHeaders({ enableReferrerPolicy: false }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Referrer-Policy')).toBeNull();
  });

  it('should allow Permissions-Policy to be disabled', async () => {
    const app = new Hono();
    app.use('*', securityHeaders({ enablePermissionsPolicy: false }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Permissions-Policy')).toBeNull();
  });

  it('should combine multiple custom configurations', async () => {
    const app = new Hono();
    const customCSP = "default-src 'self';";
    app.use('*', securityHeaders({
      enableHSTS: false,
      cspDirectives: customCSP,
      hstsMaxAge: 86400,
    }));
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Strict-Transport-Security')).toBeNull();
    expect(res.headers.get('Content-Security-Policy')).toBe(customCSP);
  });

  it('should always include X-XSS-Protection header', async () => {
    const app = new Hono();
    app.use('*', securityHeaders());
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block');
  });

  it('should always include X-Permitted-Cross-Domain-Policies header', async () => {
    const app = new Hono();
    app.use('*', securityHeaders());
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
  });

  it('should always include Cross-Origin-Opener-Policy header', async () => {
    const app = new Hono();
    app.use('*', securityHeaders());
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
  });

  it('should always include Cross-Origin-Resource-Policy header', async () => {
    const app = new Hono();
    app.use('*', securityHeaders());
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    expect(res.headers.get('Cross-Origin-Resource-Policy')).toBe('same-site');
  });

  it('should use correct default Permissions-Policy value', async () => {
    const app = new Hono();
    app.use('*', securityHeaders());
    app.get('/test', (c) => c.json({ success: true }));

    const res = await app.request('/test');

    expect(res.status).toBe(200);
    const permissionsPolicy = res.headers.get('Permissions-Policy');
    expect(permissionsPolicy).toContain('geolocation=()');
    expect(permissionsPolicy).toContain('microphone=()');
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('payment=()');
  });
});
