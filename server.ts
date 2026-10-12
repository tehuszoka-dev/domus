import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// ROTA DE STATUS DA APLICAÃ‡ÃƒO
app.get('/api/status', (_req, res) => {
  res.json({
    app: 'DOMUS',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// INTEGRAÃ‡ÃƒO COM VITE EM DESENVOLVIMENTO OU ARQUIVOS ESTÃTICOS EM PRODUÃ‡ÃƒO
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DOMUS Full-Stack Server rodando na porta ${PORT}`);
  });
}

startServer();