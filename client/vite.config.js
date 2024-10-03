import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    headers: {
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      // Added subdomains (a, b, c) of CartoDB basemap URL to img-src
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://a.basemaps.cartocdn.com https://b.basemaps.cartocdn.com https://c.basemaps.cartocdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:3001; frame-ancestors 'none';",
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'geolocation=(self)',
      'X-Content-Type-Options': 'nosniff',
    }
  }
});
