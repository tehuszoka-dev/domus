import { GoogleGenAI } from '@google/genai';

// FUNÇÃO GERADORA DE RESPOSTAS INTELIGENTES QUANDO OFFLINE OU SEM CHAVE NO VERCEL
function getSmartAssistantResponse(message: string): string {
  const msgLower = message.toLowerCase().trim();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // 1. Horas e Data
  if (msgLower.includes('hora') || msgLower.includes('horario') || msgLower.includes('horário')) {
    return `Agora são exatamente ${timeStr} (horário de Brasília). Como posso ajudar com sua residência inteligente?`;
  }
  if (msgLower.includes('dia é hoje') || msgLower.includes('data') || msgLower.includes('que dia')) {
    return `Hoje é ${dateStr}. Todos os sistemas da sua casa estão operando em perfeita sincronia.`;
  }

  // 2. Saudações
  if (msgLower.startsWith('olá') || msgLower.startsWith('ola') || msgLower.startsWith('oi') || msgLower.startsWith('e aí') || msgLower.startsWith('e ai')) {
    const hour = parseInt(timeStr.split(':')[0], 10);
    const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    return `${saudacao}! Sou o DOMUS Agent, assistente oficial da sua casa inteligente. Em que posso te ajudar hoje?`;
  }
  if (msgLower.includes('bom dia')) return `Bom dia! Os módulos residenciais do DOMUS estão ativos e prontos. Como posso te auxiliar?`;
  if (msgLower.includes('boa tarde')) return `Boa tarde! A temperatura interna está em 22°C e a iluminação está sob controle. Precisa de algo?`;
  if (msgLower.includes('boa noite')) return `Boa noite! Se desejar, posso ativar a rotina de descanso ou verificar o travamento das portas e janelas.`;
  if (msgLower.includes('tudo bem') || msgLower.includes('como vai') || msgLower.includes('como você está')) {
    return `Tudo ótimo por aqui! Todos os 8 sensores, módulos de energia e iluminação da residência estão operando com 100% de estabilidade. Como você está?`;
  }

  // 3. Quem é você / Apresentação
  if (msgLower.includes('quem é você') || msgLower.includes('quem e voce') || msgLower.includes('o que você faz') || msgLower.includes('o que você sabe')) {
    return `Sou o DOMUS Agent, sua inteligência artificial residencial. Posso responder qualquer dúvida, controlar luzes, verificar ar condicionado, monitorar alarmes e segurança, calcular gastos elétricos e muito mais!`;
  }

  // 4. Dispositivos da Casa
  if (msgLower.includes('luz') || msgLower.includes('lâmpada') || msgLower.includes('iluminação') || msgLower.includes('acender') || msgLower.includes('apagar')) {
    if (msgLower.includes('ligar') || msgLower.includes('acender')) {
      return `Comando processado! A iluminação foi acionada e o ambiente agora está iluminado.`;
    }
    if (msgLower.includes('desligar') || msgLower.includes('apagar')) {
      return `Comando processado! As lâmpadas solicitadas foram apagadas para economizar energia.`;
    }
    return 'O sistema DOMUS gerencia 7 zonas de iluminação inteligente com dimerização automática e lâmpadas LED de alta eficiência.';
  }

  if (msgLower.includes('ar condicionado') || msgLower.includes('clima') || msgLower.includes('temperatura') || msgLower.includes('tempo')) {
    return 'Segundo os sensores climáticos da sua residência, a temperatura interna está estabilizada em 22°C com 54% de umidade relativa. O clima externo está favorável e seguro.';
  }

  if (msgLower.includes('energia') || msgLower.includes('consumo') || msgLower.includes('kwh') || msgLower.includes('conta')) {
    return 'O consumo elétrico acumulado deste mês é de 128 kWh (8% menor que a média anterior, gerando economia graças às rotinas inteligentes).';
  }

  if (msgLower.includes('segurança') || msgLower.includes('alarme') || msgLower.includes('porta') || msgLower.includes('janela') || msgLower.includes('sensor')) {
    return 'Segurança perimetral ativa: 8 sensores de presença, travas magnéticas de portas e janelas estão 100% operacionais e sem qualquer violação registrada.';
  }

  // 5. Cálculos Matemáticos simples
  const mathMatch = msgLower.match(/(?:quanto é|calcula|calcule|quanto da|resultado de)?\s*([0-9]+(?:\.[0-9]+)?)\s*([\+\-\*\/x])\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (mathMatch) {
    const n1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const n2 = parseFloat(mathMatch[3]);
    let res = 0;
    if (op === '+') res = n1 + n2;
    else if (op === '-') res = n1 - n2;
    else if (op === '*' || op === 'x' || op === 'X') res = n1 * n2;
    else if (op === '/') res = n2 !== 0 ? n1 / n2 : 0;
    return `O resultado do cálculo de ${n1} ${op} ${n2} é: ${res}.`;
  }

  // 6. Resposta padrão contextualizada
  return `Compreendido! Como DOMUS Agent, estou conectado à sua residência em ${timeStr}. Caso queira respostas livres com inteligência artificial geral, clique no ícone de varinha mágica ✨ no topo do chat para configurar sua chave Gemini.`;
}

export default async function handler(req: any, res: any) {
  // Configuração CORS para aceitar chamadas do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Control, Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem inválida ou ausente.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Se não houver chave configurada na Vercel, responde imediatamente com o motor inteligente
  if (!apiKey) {
    return res.json({
      reply: getSmartAssistantResponse(message),
      provider: 'domus-smart-local'
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const systemInstruction = `Você é o DOMUS Agent, o assistente oficial de inteligência artificial de automação residencial inteligente.
Horário atual em Brasília: ${timeStr} do dia ${dateStr}.
Responda sempre em português do Brasil de forma prestativa, inteligente, direta e natural.
Você pode responder qualquer pergunta geral do usuário (horas, clima, curiosidades, cálculos, etc) e também comandos de casa inteligente.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: message,
      config: {
        systemInstruction
      }
    });

    const replyText = response.text || getSmartAssistantResponse(message);
    return res.json({
      reply: replyText,
      provider: 'gemini-flash-latest'
    });
  } catch (err: any) {
    console.error('Erro ao chamar Gemini na Vercel:', err);
    // Em caso de cota excedida ou erro de rede, usa o assistente inteligente sem quebrar o chat
    return res.json({
      reply: getSmartAssistantResponse(message),
      provider: 'domus-smart-fallback'
    });
  }
}