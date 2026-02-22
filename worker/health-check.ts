import { HealthCheckConfig } from './config/security';

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
  lastError: string | null;
}

const healthStatus = new Map<string, ServiceHealthStatus>();

export class ExternalServiceHealth {
  private static async checkService(
    serviceName: string,
    url: string,
    timeoutMs: number = HealthCheckConfig.DEFAULT_TIMEOUT_MS
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      const result: HealthCheckResult = {
        service: serviceName,
        healthy: response.ok,
        latency,
        timestamp,
      };

      this.updateHealthStatus(serviceName, result.healthy, timestamp);
      return result;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const result: HealthCheckResult = {
        service: serviceName,
        healthy: false,
        latency,
        timestamp,
        error: errorMessage,
      };

      this.updateHealthStatus(serviceName, false, timestamp, errorMessage);
      return result;
    }
  }

  static async checkWebhookService(url: string, timeoutMs: number = HealthCheckConfig.DEFAULT_TIMEOUT_MS): Promise<HealthCheckResult> {
    return this.checkService('webhook', url, timeoutMs);
  }

  static async checkDocsService(url: string, timeoutMs: number = HealthCheckConfig.DEFAULT_TIMEOUT_MS): Promise<HealthCheckResult> {
    return this.checkService('docs', url, timeoutMs);
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
        isHealthy: consecutiveFailures < HealthCheckConfig.MAX_CONSECUTIVE_FAILURES,
        lastError: error ?? null,
      });
    } else {
      healthStatus.set(service, {
        service,
        lastCheck: timestamp,
        lastSuccess: healthy ? timestamp : null,
        lastFailure: healthy ? null : timestamp,
        consecutiveFailures: healthy ? 0 : 1,
        isHealthy: healthy,
        lastError: error ?? null,
      });
    }
  }
}
