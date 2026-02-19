import { Hono } from 'hono';
import type { Env } from './core-utils';
import { CircuitBreaker } from '@shared/CircuitBreaker';
import { withRetry } from './resilience/Retry';
import { withErrorHandler } from './routes/route-utils';
import { TimeConstants, RetryDelay } from './config/time';
import { RETRY_CONFIG } from '@shared/constants';
import type { Context } from 'hono';

const docsCircuitBreaker = new CircuitBreaker('docs-api-spec', {
  failureThreshold: 5,
  timeoutMs: TimeConstants.ONE_HOUR_MS,
});

async function fetchWithRetry(url: string): Promise<Response> {
  return await withRetry(
    async () => {
      const response = await docsCircuitBreaker.execute(async () => {
        return await fetch(url, {
          signal: AbortSignal.timeout(RetryDelay.THIRTY_SECONDS_MS),
        });
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch spec: ${response.status} ${response.statusText}`);
      }

      return response;
    },
    {
      maxRetries: RETRY_CONFIG.DEFAULT_MAX_RETRIES,
      baseDelay: RETRY_CONFIG.DEFAULT_BASE_DELAY_MS,
      jitterMs: TimeConstants.SECOND_MS,
      timeout: RetryDelay.THIRTY_SECONDS_MS
    }
  );
}

export function docsRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api-docs', withErrorHandler('load API documentation')(async (c: Context) => {
    const specUrl = new URL(c.req.url);
    specUrl.pathname = '/openapi.yaml';

    const response = await fetchWithRetry(specUrl.toString());
    const spec = await response.text();
    return c.text(spec, 200, {
      'Content-Type': 'application/x-yaml',
    });
  }));

  app.get('/api-docs.yaml', withErrorHandler('load OpenAPI specification')(async (c: Context) => {
    const specUrl = new URL(c.req.url);
    specUrl.pathname = '/openapi.yaml';

    const response = await fetchWithRetry(specUrl.toString());
    const spec = await response.text();
    return c.text(spec, 200, {
      'Content-Type': 'application/x-yaml',
    });
  }));

  app.get('/api-docs.html', async (c) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akademia Pro API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" integrity="sha384-rcbEi6xgdPk0iWkAQzT2F3FeBJXdG+ydrawGlfHAFIZG7wU6aKbQaRewysYpmrlW" crossorigin="anonymous">
  <style>
    body { margin: 0; padding: 0; }
    #swagger-ui { max-width: 1460px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" integrity="sha384-NXtFPpN61oWCuN4D42K6Zd5Rt2+uxeIT36R7kpXBuY9tLnZorzrJ4ykpqwJfgjpZ" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js" integrity="sha384-qr68CD0cvHa88PmVu7e1a58Ego4qvKtcvcLdS2a8Mo5zILI01gyIV9jVwJk7X2NU" crossorigin="anonymous"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.Apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        displayRequestDuration: true,
        docExpansion: "list",
        filter: true,
        tryItOutEnabled: true,
        persistAuthorization: true
      });
    };
  </script>
</body>
</html>
    `;

    return c.html(html);
  });
}
