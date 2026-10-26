import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// El front reutiliza las reglas, precios y tipos del backend en lugar de duplicarlos.
const BACKEND_SRC = fileURLToPath(new URL('../backend/src', import.meta.url));
const RAIZ_REPO = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  // EMAIL_DEMO sale del .env de la raíz (el mismo que lee el backend) o, en Docker, del build arg.
  const entorno = loadEnv(mode, RAIZ_REPO, '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@backend': BACKEND_SRC },
    },
    define: {
      'import.meta.env.EMAIL_DEMO': JSON.stringify(entorno.EMAIL_DEMO || 'visitante@mail.com'),
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
  };
});
