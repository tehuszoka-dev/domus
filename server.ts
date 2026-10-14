import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// ROTA DE STATUS DA APLICAÇÃO
app.get('/api/status', (_req, res) => {
  res.json({
    app: 'DOMUS',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// ROTAS DIRETAS DE DOWNLOAD E TEXTO PURO (UTF-8 GARANTIDO)
const allowedFiles = [
  'index.html',
  'style.css',
  'login.html',
  'codigos.html',
  'package.json',
  'server.ts',
  'supabase-schema.sql',
  'vercel.json',
  'vite.config.ts',
];

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!allowedFiles.includes(filename)) {
    return res.status(404).send('Arquivo não encontrado');
  }
  const filePath = path.resolve(__dirname, filename);
  res.setHeader('Content-Type', filename.endsWith('.css') ? 'text/css; charset=utf-8' : filename.endsWith('.json') ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.sendFile(filePath);
});

app.get('/api/raw/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!allowedFiles.includes(filename)) {
    return res.status(404).send('Arquivo não encontrado');
  }
  const filePath = path.resolve(__dirname, filename);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.sendFile(filePath);
});

// ROTAS DEDICADAS DE AUTENTICAÇÃO E LOGIN COM UTF-8
app.get(['/login', '/login.html', '/auth', '/auth/login.html'], (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const isProduction = process.env.NODE_ENV === 'production';
  const filePath = isProduction
    ? path.resolve(__dirname, 'dist', 'login.html')
    : path.resolve(__dirname, 'login.html');
  return res.sendFile(filePath);
});

// SERVE CENTRAL DE CODIGOS COM UTF-8
app.get(['/codigos', '/codigos.html'], (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.sendFile(path.resolve(__dirname, 'codigos.html'));
});

// INTEGRAÇÃO COM VITE EM DESENVOLVIMENTO OU ARQUIVOS ESTÁTICOS EM PRODUÇÃO
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
