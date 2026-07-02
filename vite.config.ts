import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Forward AI chat calls to the local Express backend that holds the Gemini key.
      '/api': 'http://localhost:8787',
    },
  },
  build: {
    target: 'esnext',
  },
});
