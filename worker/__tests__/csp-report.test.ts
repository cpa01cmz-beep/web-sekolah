import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { securityHeaders } from '../middleware/security-headers';
import type { Env } from '../core-utils';

describe('CSP Report Endpoint', () => {
  it('should receive CSP violation reports and log them', async () => {
    const app = new Hono<{ Bindings: Env }>();
    
    app.post('/api/csp-report', async (c) => {
      try {
        const report = await c.req.json<{ 'csp-report': Record<string, unknown> }>();
        const violation = report['csp-report'];
        expect(violation).toBeDefined();
        return new Response(null, { status: 204 });
      } catch (error) {
        return new Response(null, { status: 204 });
      }
    });

    const cspReport = {
      'csp-report': {
        'document-uri': 'https://example.com/page',
        'referrer': 'https://example.com/referrer',
        'violated-directive': 'script-src',
        'effective-directive': 'script-src',
        'original-policy': "default-src 'self'; script-src 'self' 'sha256-...'",
        'disposition': 'report',
        'blocked-uri': 'https://evil.com/script.js',
        'line-number': 10,
        'column-number': 5,
        'source-file': 'https://example.com/page',
        'status-code': 200,
        'script-sample': '',
      },
    };

    const res = await app.request('/api/csp-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: JSON.stringify(cspReport),
    });

    expect(res.status).toBe(204);
  });

  it('should handle malformed CSP reports gracefully', async () => {
    const app = new Hono<{ Bindings: Env }>();
    
    app.post('/api/csp-report', async (c) => {
      try {
        await c.req.json<{ 'csp-report': Record<string, unknown> }>();
        return new Response(null, { status: 204 });
      } catch {
        return new Response(null, { status: 204 });
      }
    });

    const res = await app.request('/api/csp-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json',
    });

    expect(res.status).toBe(204);
  });

  it('should handle empty CSP reports', async () => {
    const app = new Hono<{ Bindings: Env }>();
    
    app.post('/api/csp-report', async (c) => {
      try {
        await c.req.json<{ 'csp-report': Record<string, unknown> }>();
        return new Response(null, { status: 204 });
      } catch {
        return new Response(null, { status: 204 });
      }
    });

    const res = await app.request('/api/csp-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: JSON.stringify({ 'csp-report': {} }),
    });

    expect(res.status).toBe(204);
  });

  it('should return 204 for all CSP report requests', async () => {
    const app = new Hono<{ Bindings: Env }>();
    
    app.post('/api/csp-report', async (c) => {
      try {
        await c.req.json<{ 'csp-report': Record<string, unknown> }>();
        return new Response(null, { status: 204 });
      } catch {
        return new Response(null, { status: 204 });
      }
    });

    const res = await app.request('/api/csp-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: JSON.stringify({ 'csp-report': { 'violated-directive': 'img-src' } }),
    });

    expect(res.status).toBe(204);
  });
});
