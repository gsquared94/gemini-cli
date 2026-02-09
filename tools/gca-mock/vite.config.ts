import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'client',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://localhost:3000',
      '/v1internal': {
        target: 'https://localhost:3000',
        secure: false, // accept self-signed
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
