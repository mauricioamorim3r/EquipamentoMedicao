# Configuração da API Key da OpenAI

## Configuração Segura

A API key da OpenAI foi configurada como variável de ambiente para manter a segurança:

### Variável de Ambiente
```bash
OPENAI_API_KEY="sua-api-key-aqui"
```

### Como Usar no Código

#### No Backend (Node.js/Express)
```typescript
// Acessar a API key
const openaiApiKey = process.env.OPENAI_API_KEY;

// Exemplo de uso com a biblioteca oficial da OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Exemplo de função para gerar texto com GPT
async function generateTextWithGPT(prompt: string, model = "gpt-3.5-turbo") {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
      max_tokens: 150,
      temperature: 0.7,
    });
    
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Erro ao gerar conteúdo OpenAI:', error);
    throw error;
  }
}

// Exemplo para GPT-4
async function generateWithGPT4(prompt: string) {
  return generateTextWithGPT(prompt, "gpt-4");
}
```

#### Exemplo com Streaming
```typescript
async function generateStreamingResponse(prompt: string) {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      // Aqui você pode processar cada chunk em tempo real
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Erro no streaming OpenAI:', error);
    throw error;
  }
}
```

#### No Frontend (React/TypeScript)
**⚠️ IMPORTANTE:** Nunca exponha a API key diretamente no frontend!

```typescript
// ❌ NUNCA faça isso:
// const apiKey = "sk-admin-3KGN...";

// ✅ Faça isso: Chame uma API do seu backend
async function callOpenAIAPI(prompt: string, model = "gpt-3.5-turbo") {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });
  
  if (!response.ok) {
    throw new Error('Erro na API OpenAI');
  }
  
  return response.json();
}

// Para streaming no frontend
async function callOpenAIStreamingAPI(prompt: string) {
  const response = await fetch('/api/openai/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const reader = response.body?.getReader();
  // Processar stream...
}
```

## Modelos Disponíveis

### GPT-3.5 Turbo
- **Modelo:** `gpt-3.5-turbo`
- **Uso:** Conversas, texto geral
- **Custo:** Mais barato

### GPT-4
- **Modelo:** `gpt-4`
- **Uso:** Tarefas complexas, análise detalhada
- **Custo:** Mais caro, mas mais preciso

### GPT-4 Turbo
- **Modelo:** `gpt-4-turbo-preview`
- **Uso:** Melhor performance, contexto maior
- **Custo:** Intermediário

## Segurança

### ✅ Boas Práticas Implementadas:
- ✅ API key armazenada em variável de ambiente
- ✅ Arquivo `.env` listado no `.gitignore`
- ✅ Exemplo no `.env.example` sem exposição da key real
- ✅ Documentação sobre uso seguro

### ⚠️ Lembretes de Segurança:
1. **Nunca** commite o arquivo `.env` no Git
2. **Nunca** exponha a API key no frontend
3. **Sempre** use o backend como proxy para chamadas à API
4. **Sempre** valide e sanitize inputs antes de enviar para a API
5. **Configure** limites de uso no dashboard da OpenAI
6. **Monitore** o uso para evitar custos excessivos

## Instalação de Dependências

Para usar a OpenAI, instale a biblioteca oficial:

```bash
npm install openai
```

## Exemplo de Endpoint no Backend

```typescript
// server/routes.ts ou arquivo similar
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/openai', async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo' } = req.body;
    
    // Validar entrada
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt inválido' });
    }
    
    // Limitar tamanho do prompt
    if (prompt.length > 2000) {
      return res.status(400).json({ error: 'Prompt muito longo' });
    }
    
    // Validar modelo
    const allowedModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'];
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ error: 'Modelo não permitido' });
    }
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const text = completion.choices[0]?.message?.content || '';
    
    res.json({ 
      text,
      model: completion.model,
      usage: completion.usage 
    });
  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    
    // Tratar erros específicos da OpenAI
    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ error: 'Limite de requisições excedido' });
    }
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ error: 'Cota insuficiente' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para streaming
app.post('/api/openai/stream', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }
    
    res.end();
  } catch (error) {
    console.error('Erro no streaming OpenAI:', error);
    res.status(500).json({ error: 'Erro no streaming' });
  }
});
```

## Monitoramento de Uso

Monitore o uso da API no [Dashboard da OpenAI](https://platform.openai.com/usage) para:
- Verificar quotas e limites
- Monitorar custos em tempo real
- Configurar alertas de uso
- Revisar histórico de requisições
- Definir limites de gastos

## Tratamento de Erros Comuns

```typescript
// Função utilitária para tratar erros da OpenAI
function handleOpenAIError(error: any) {
  switch (error.code) {
    case 'rate_limit_exceeded':
      return { status: 429, message: 'Muitas requisições. Tente novamente em alguns segundos.' };
    case 'insufficient_quota':
      return { status: 402, message: 'Cota da API excedida.' };
    case 'invalid_api_key':
      return { status: 401, message: 'API key inválida.' };
    case 'model_not_found':
      return { status: 404, message: 'Modelo não encontrado.' };
    default:
      return { status: 500, message: 'Erro interno da API.' };
  }
}
```

## Custos e Otimização

### Dicas para Reduzir Custos:
1. **Use GPT-3.5** para tarefas simples
2. **Limite max_tokens** conforme necessário
3. **Implemente cache** para respostas similares
4. **Monitore usage** regularmente
5. **Configure billing limits** no dashboard
6. **Use system messages** para instruções reutilizáveis