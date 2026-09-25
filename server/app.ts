import express from 'express';
import cors from 'cors';
import path from 'path';
import roomsRouter from './routes/rooms';
import reservationsRouter from './routes/reservations';
import settingsRouter from './routes/settings';

export function createApp() {
  const app = express();

  // Cross-Origin Resource Sharing and JSON Body Parsing
  app.use(cors());
  app.use(express.json());

  // Static assets from public folder (favicon, images, etc.)
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    if (res.headersSent) return;
    return res.json({
      status: 'ok',
      service: 'diversion-vigan-api',
      timestamp: new Date().toISOString(),
    });
  });

  // Dedicated API subrouters
  app.use('/api/rooms', roomsRouter);
  app.use('/api/reservations', reservationsRouter);
  app.use('/api/bookings', reservationsRouter);
  app.use('/api/settings', settingsRouter);

  // Dedicated API 404 handler - prevents fall-through to HTML error pages
  app.all('/api/*', (_req, res) => {
    if (res.headersSent) return;
    return res.status(404).json({ error: 'API route not found' });
  });

  // Global Error Handler guaranteeing headers are never modified after being sent
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    const statusCode = typeof err.status === 'number' ? err.status : 500;
    return res.status(statusCode).json({
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}
