import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';

const isProduction = process.env.NODE_ENV === 'production';
const bundledServer = path.resolve(process.cwd(), 'dist-server', 'server.js');

if (isProduction && fs.existsSync(bundledServer)) {
  await import(path.resolve(process.cwd(), 'dist-server', 'server.js'));
} else {
  const express = (await import('express')).default;
  const { createApp } = await import('./server/app.ts');
  const PORT = Number(process.env.PORT) || 3000;
  const app = createApp();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req: any, res: any) => {
      if (res.headersSent) return;
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'), (err: any) => {
        if (err && !res.headersSent) {
          res.status(500).send('Error loading application');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Diversion Vigan] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}
