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

export interface HealthCheckConfig {
  serviceName: string;
  url: string;
  timeoutMs?: number;
  method?: 'HEAD' | 'GET';
}

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_METHOD = 'HEAD';

const healthStatus = new Map<string, ServiceHealthStatus>();

async function performHealthCheck(config: HealthCheckConfig): Promise<HealthCheckResult> {
  const { serviceName, url, timeoutMs = DEFAULT_TIMEOUT_MS, method = DEFAULT_METHOD } = config;
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method,
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

    ExternalServiceHealth.updateHealthStatusInternal(serviceName, result.healthy, timestamp);
    return result;
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const result: HealthCheckResult = {
      service: serviceName,
      healthy: false,
      latency,
      timestamp,
      error: errorMessage,
    };

    ExternalServiceHealth.updateHealthStatusInternal(serviceName, false, timestamp, errorMessage);
    return result;
  }
}

export class ExternalServiceHealth {
  private static readonly FAILURE_THRESHOLD = 5;

  static async checkWebhookService(url: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<HealthCheckResult> {
    return performHealthCheck({ serviceName: 'webhook', url, timeoutMs });
  }

  static async checkDocsService(url: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<HealthCheckResult> {
    return performHealthCheck({ serviceName: 'docs', url, timeoutMs });
  }

  static async checkService(config: HealthCheckConfig): Promise<HealthCheckResult> {
    return performHealthCheck(config);
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

  static updateHealthStatusInternal(service: string, healthy: boolean, timestamp: string, error?: string): void {
    const existing = healthStatus.get(service);
    
    if (existing) {
      const consecutiveFailures = healthy ? 0 : existing.consecutiveFailures + 1;
      
      healthStatus.set(service, {
        service,
        lastCheck: timestamp,
        lastSuccess: healthy ? timestamp : existing.lastSuccess,
        lastFailure: healthy ? existing.lastFailure : timestamp,
        consecutiveFailures,
        isHealthy: consecutiveFailures < this.FAILURE_THRESHOLD,
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
