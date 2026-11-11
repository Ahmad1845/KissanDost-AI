import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { settings } from './src/backend/config/settings.ts';
import {
  rateLimitMiddleware,
  requestLoggerMiddleware,
  centralizedErrorHandler,
  logger,
} from './src/backend/middleware/apiMiddleware.ts';
import { v1Router } from './src/backend/api/v1Router.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Request Parsing & Middleware Pipeline
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(requestLoggerMiddleware);
app.use(rateLimitMiddleware);

// Mount Modular v1 AI & Agronomic Microservice Routes
app.use('/api', v1Router);

// Centralized API Exception Handler
app.use('/api', centralizedErrorHandler);

async function setupServer() {
  const isProd = settings.environment === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: settings.port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(settings.port, '0.0.0.0', () => {
    logger.info('SERVER_LISTENING', {
      url: `http://localhost:${settings.port}`,
      networkUrl: `http://0.0.0.0:${settings.port}`,
      version: settings.version,
    });
  });
}

setupServer().catch((err) => {
  logger.error('SERVER_INIT_FAILED', { error: err?.message || String(err) });
});
