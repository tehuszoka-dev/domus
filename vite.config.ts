import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detecta com segurança apenas os arquivos HTML que existem no computador
const input: Record<string, string> = {
  main: path.resolve(__dirname, 'index.html'),
};

if (fs.existsSync(path.resolve(__dirname, 'login.html'))) {
  input.login = path.resolve(__dirname, 'login.html');
}

if (fs.existsSync(path.resolve(__dirname, 'codigos.html'))) {
  input.codigos = path.resolve(__dirname, 'codigos.html');
}

if (fs.existsSync(path.resolve(__dirname, 'suporte.html'))) {
  input.suporte = path.resolve(__dirname, 'suporte.html');
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      input,
    },
  },
  server: {
    port: 3000,
  },
});
