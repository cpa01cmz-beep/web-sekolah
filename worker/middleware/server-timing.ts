import type { Context, Next } from 'hono';

interface TimingMetrics {
  name: string;
  duration: number;
  description?: string;
}

function formatServerTiming(metrics: TimingMetrics[]): string {
  return metrics
    .map((m) => {
      const desc = m.description ? `; desc="${m.description}"` : '';
      return `${m.name}; dur=${m.duration.toFixed(2)}${desc}`;
    })
    .join(', ');
}

export function serverTiming() {
  return async (c: Context, next: Next) => {
    const startTime = performance.now();
    const requestStart = Date.now();

    c.header('X-Request-Start', requestStart.toString());

    await next();

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metrics: TimingMetrics[] = [
      {
        name: 'total',
        duration,
        description: 'Total request processing time',
      },
    ];

    c.header('Server-Timing', formatServerTiming(metrics));
    c.header('X-Response-Time', `${duration.toFixed(2)}ms`);
  };
}

export function createServerTimingMiddleware() {
  return serverTiming();
}
