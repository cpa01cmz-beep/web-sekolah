import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { healthRoutes } from '../health-routes';
import { integrationMonitor } from '../../integration-monitor';

describe('Health Routes', () => {
  let app: Hono<{ Bindings: Record<string, unknown> }>;

  beforeEach(() => {
    app = new Hono<{ Bindings: Record<string, unknown> }>();
    healthRoutes(app);
    integrationMonitor.reset();
  });

  describe('GET /api/health/live', () => {
    it('should return alive status', async () => {
      const res = await app.request('/api/health/live');
      expect(res.status).toBe(200);
      
      const json = await res.json() as { success: boolean; data: { status: string; timestamp: string } };
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('alive');
      expect(json.data.timestamp).toBeDefined();
    });

    it('should return valid ISO timestamp', async () => {
      const res = await app.request('/api/health/live');
      const json = await res.json() as { data: { timestamp: string } };
      
      const timestamp = new Date(json.data.timestamp);
      expect(timestamp.toISOString()).toBe(json.data.timestamp);
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return ready status when all checks pass', async () => {
      const res = await app.request('/api/health/ready');
      expect(res.status).toBe(200);
      
      const json = await res.json() as { 
        success: boolean; 
        data: { 
          status: string; 
          checks: Record<string, { status: string }> 
        } 
      };
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('ready');
      expect(json.data.checks.circuitBreaker.status).toBe('healthy');
      expect(json.data.checks.webhook.status).toBe('healthy');
      expect(json.data.checks.errorRate.status).toBe('healthy');
    });

    it('should return not_ready when circuit breaker is open', async () => {
      integrationMonitor.setCircuitBreakerState({
        isOpen: true,
        failureCount: 5,
        lastFailureTime: Date.now(),
        lastSuccessTime: null,
      });

      const res = await app.request('/api/health/ready');
      expect(res.status).toBe(503);
      
      const json = await res.json() as { 
        success: boolean; 
        data: { 
          status: string; 
          checks: Record<string, { status: string }> 
        } 
      };
      expect(json.success).toBe(false);
      expect(json.data.status).toBe('not_ready');
      expect(json.data.checks.circuitBreaker.status).toBe('unhealthy');
    });

    it('should return valid ISO timestamp', async () => {
      const res = await app.request('/api/health/ready');
      const json = await res.json() as { data: { timestamp: string } };
      
      const timestamp = new Date(json.data.timestamp);
      expect(timestamp.toISOString()).toBe(json.data.timestamp);
    });

    it('should include all check names', async () => {
      const res = await app.request('/api/health/ready');
      const json = await res.json() as { data: { checks: Record<string, unknown> } };
      
      expect(json.data.checks).toHaveProperty('circuitBreaker');
      expect(json.data.checks).toHaveProperty('webhook');
      expect(json.data.checks).toHaveProperty('errorRate');
    });
  });
});
