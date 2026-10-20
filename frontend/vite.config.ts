import { fileURLToPath } from 'node:url';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// El front reutiliza las reglas, precios y tipos del backend en lugar de duplicarlos.
const BACKEND_SRC = fileURLToPath(new URL('../backend/src', import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@backend': BACKEND_SRC },
  },
  server: {
    port: 5173,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), BACKEND_SRC],
    },
    // El backend no expone CORS: en desarrollo las llamadas a /api pasan por el proxy de Vite.
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
});
