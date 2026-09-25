import 'dotenv/config';
import path from 'path';
import express from 'express';
import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3000;

const app = createApp();
const distPath = path.join(process.cwd(), 'dist');

// Serve static compiled assets from Vite dist/
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*all', (req, res) => {
  if (res.headersSent) return;
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err && !res.headersSent) {
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Diversion Vigan] Production Full-stack Server listening on http://0.0.0.0:${PORT}`);
});
