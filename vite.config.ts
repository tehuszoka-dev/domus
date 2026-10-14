import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // CONFIGURAÇÃO MULTI-PÁGINA OBRIGATÓRIA PARA O VERCEL:
  // Faz o Vite compilar index.html, login.html e codigos.html na pasta dist/
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        login: path.resolve(__dirname, 'login.html'),
        codigos: path.resolve(__dirname, 'codigos.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
});