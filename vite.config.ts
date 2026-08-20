import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isVercel = process.env.VERCEL === '1' || process.env.NOW_BUILDER === '1';

  return {
    server: {
      host: '0.0.0.0',
      proxy: isVercel ? {} : {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/tomtom': {
          target: 'https://api.tomtom.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tomtom/, ''),
          secure: false,
        }
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://api.tomtom.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.tomtom.com https://*.tile.openstreetmap.org https://api.pwnedpasswords.com https://apis.google.com; frame-src 'self' https://accounts.google.com/ https://content.googleapis.com; object-src 'none'; base-uri 'self';"
      }
    },
    plugins: [react()],
    build: {
      target: 'es2022'
    },
    esbuild: {
      target: 'es2022'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
