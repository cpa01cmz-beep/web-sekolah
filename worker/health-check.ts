export interface HealthCheckResult {
  service: string;
  healthy: boolean;
  latency: number;
  timestamp: string;
  error?: string;
}

export interface ServiceHealthStatus {
  service: string;
  lastCheck: string;
  lastSuccess: string | null;
  lastFailure: string | null;
  consecutiveFailures: number;
  isHealthy: boolean;
}

const healthStatus = new Map<string, ServiceHealthStatus>();

export class ExternalServiceHealth {
  static async checkWebhookService(url: string, timeoutMs: number = 5000): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      const result: HealthCheckResult = {
        service: 'webhook',
        healthy: response.ok,
        latency,
        timestamp,
      };

      this.updateHealthStatus('webhook', result.healthy, timestamp);
      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const result: HealthCheckResult = {
        service: 'webhook',
        healthy: false,
        latency,
        timestamp,
        error: errorMessage,
      };

      this.updateHealthStatus('webhook', false, timestamp, errorMessage);
      return result;
    }
  }

  static async checkDocsService(url: string, timeoutMs: number = 5000): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      const result: HealthCheckResult = {
        service: 'docs',
        healthy: response.ok,
        latency,
        timestamp,
      };

      this.updateHealthStatus('docs', result.healthy, timestamp);
      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const result: HealthCheckResult = {
        service: 'docs',
        healthy: false,
        latency,
        timestamp,
        error: errorMessage,
      };

      this.updateHealthStatus('docs', false, timestamp, errorMessage);
      return result;
    }
  }

  static getHealthStatus(service: string): ServiceHealthStatus | null {
    return healthStatus.get(service) || null;
  }

  static getAllHealthStatus(): Record<string, ServiceHealthStatus> {
    return Object.fromEntries(healthStatus);
  }

  static resetHealthStatus(service: string): void {
    healthStatus.delete(service);
  }

  static resetAllHealthStatus(): void {
    healthStatus.clear();
  }

  private static updateHealthStatus(service: string, healthy: boolean, timestamp: string, error?: string): void {
    const existing = healthStatus.get(service);
    
    if (existing) {
      const consecutiveFailures = healthy ? 0 : existing.consecutiveFailures + 1;
      
      healthStatus.set(service, {
        service,
        lastCheck: timestamp,
        lastSuccess: healthy ? timestamp : existing.lastSuccess,
        lastFailure: healthy ? existing.lastFailure : timestamp,
        consecutiveFailures,
        isHealthy: consecutiveFailures < 5,
      });
    } else {
      healthStatus.set(service, {
        service,
        lastCheck: timestamp,
        lastSuccess: healthy ? timestamp : null,
        lastFailure: healthy ? null : timestamp,
        consecutiveFailures: healthy ? 0 : 1,
        isHealthy: healthy,
      });
    }
  }
}
