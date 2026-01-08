import { Hono } from 'hono';
import type { Env } from './core-utils';

export function docsRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api-docs', async (c) => {
    const specUrl = new URL(c.req.url);
    specUrl.pathname = '/openapi.yaml';
    
    try {
      const response = await fetch(specUrl.toString());
      if (!response.ok) {
        throw new Error('OpenAPI spec not found');
      }
      
      const spec = await response.text();
      return c.text(spec, 200, {
        'Content-Type': 'application/x-yaml',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to load OpenAPI specification',
        code: 'INTERNAL_SERVER_ERROR',
      }, 500);
    }
  });

  app.get('/api-docs.yaml', async (c) => {
    const specUrl = new URL(c.req.url);
    specUrl.pathname = '/openapi.yaml';
    
    try {
      const response = await fetch(specUrl.toString());
      if (!response.ok) {
        throw new Error('OpenAPI spec not found');
      }
      
      const spec = await response.text();
      return c.text(spec, 200, {
        'Content-Type': 'application/x-yaml',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to load OpenAPI specification',
        code: 'INTERNAL_SERVER_ERROR',
      }, 500);
    }
  });

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
