import { Hono } from 'hono';
import type { Env } from './core-utils';
import { CircuitBreaker } from './CircuitBreaker';
import { withErrorHandler } from './routes/route-utils';
import { TimeConstants } from './config/time';
import type { Context } from 'hono';

const DOCS_TIMEOUT_MS = 30000;
const DOCS_MAX_RETRIES = 3;
const DOCS_RETRY_DELAY_MS = 1000;

const docsCircuitBreaker = new CircuitBreaker('docs-api-spec', {
  failureThreshold: 5,
  timeoutMs: 60000,
});

async function fetchWithRetry(url: string, maxRetries = DOCS_MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await docsCircuitBreaker.execute(async () => {
        return await fetch(url, {
          signal: AbortSignal.timeout(DOCS_TIMEOUT_MS),
        });
      });

      if (response.ok) {
        return response;
      }

      throw new Error(`Failed to fetch spec: ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = DOCS_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * TimeConstants.SECOND_MS;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to fetch OpenAPI spec');
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
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    #swagger-ui { max-width: 1460px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
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
