import express from 'express';
import cors from 'cors';
import roomsRouter from './routes/rooms';
import reservationsRouter from './routes/reservations';
import settingsRouter from './routes/settings';

export function createApp() {
  const app = express();

  // Cross-Origin Resource Sharing and JSON Body Parsing
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'diversion-vigan-api', timestamp: new Date().toISOString() });
  });

  // Dedicated API subrouters
  app.use('/api/rooms', roomsRouter);
  app.use('/api/reservations', reservationsRouter);
  app.use('/api/settings', settingsRouter);

  return app;
}
