import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target =
    process.env.BACKEND_URL ||
    env.BACKEND_URL ||
    process.env.VITE_BACKEND_URL ||
    env.VITE_BACKEND_URL ||
    process.env.API_URL ||
    env.API_URL ||
    `http://localhost:${process.env.PORT || env.PORT || 3000}`;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
