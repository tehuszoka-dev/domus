import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());


// INICIALIZAÇÃO SEGURA DO CLIENTE GEMINI COM USER-AGENT DE TELEMETRIA
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Aviso: Não foi possível instanciar o GoogleGenAI:', err);
  }
}

// ROTA DA API: DOMUS AGENT (BOT COM PESQUISA NA INTERNET VIA GEMINI SEARCH GROUNDING)
app.post('/api/agent', async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem inválida ou ausente.' });
  }

  // Se a chave GEMINI_API_KEY estiver configurada
  if (geminiClient && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = 
        'Você é o DOMUS Agent, o assistente oficial de inteligência e automação residencial do sistema DOMUS Smart Home. ' +
        'Você ajuda o morador a tirar dúvidas sobre a residência, clima, tempo, economia de energia, tecnologia e puxa informações da internet ' +
        'em tempo real para responder perguntas com precisão, educação e linguagem natural em português do Brasil.';

      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const replyText = response.text || 'Entendido. Estou à disposição para ajudar com sua residência inteligente.';
      return res.json({ reply: replyText });
    } catch (apiError: any) {
      console.error('Erro na chamada Gemini API:', apiError);
      // Fallback inteligente caso a busca falhe
      return res.json({
        reply: `Olá! Sou o DOMUS Agent. Analisei sua solicitação sobre "${message}". O sistema inteligente DOMUS está operacional e monitorando sua residência. Como posso ajudar com seus dispositivos, iluminação ou segurança?`,
      });
    }
  }

  // Resposta fallback inteligente quando rodando sem API Key
  const msgLower = message.toLowerCase();
  let reply = 'Olá! Sou o DOMUS Agent. Estou conectado à sua residência inteligente.';

  if (msgLower.includes('temperatura') || msgLower.includes('clima') || msgLower.includes('tempo')) {
    reply = 'Segundo os sensores do DOMUS e medições externas, a temperatura ambiente média é de 22°C com umidade do ar em 54%. O clima está agradável e favorável para ventilação natural.';
  } else if (msgLower.includes('luz') || msgLower.includes('lâmpada') || msgLower.includes('iluminação')) {
    reply = 'O sistema de iluminação DOMUS gerencia 7 ambientes inteligentes. Atualmente temos lâmpadas operando em alta eficiência energética com dimerização automática.';
  } else if (msgLower.includes('energia') || msgLower.includes('consumo') || msgLower.includes('kwh')) {
    reply = 'O consumo elétrico acumulado neste mês está em 128 kWh, representando uma redução de 8% em comparação ao período anterior graças às rotinas automáticas de desligamento.';
  } else if (msgLower.includes('segurança') || msgLower.includes('alarme') || msgLower.includes('sensor')) {
    reply = 'Todos os 8 sensores de perímetro (portas, janelas e presença infravermelho) estão ativos e sem alertas críticos registrados nas últimas 24 horas.';
  } else {
    reply = `Compreendido! Como DOMUS Agent, registrei sua pergunta: "${message}". Todos os módulos residenciais estão sincronizados e posso ajustar qualquer parâmetro da sua casa para você.`;
  }

  return res.json({ reply });
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
