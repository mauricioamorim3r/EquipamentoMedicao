# Configuração das API Keys - IA (Gemini & OpenAI)

## ✅ APIs Configuradas

Este projeto tem configuradas as seguintes APIs de IA:
- 🤖 **Google Gemini AI** 
- 🤖 **OpenAI GPT** 

## Configuração Segura do Gemini

A API key do Google Gemini foi configurada como variável de ambiente para manter a segurança:

### Variável de Ambiente
```bash
GEMINI_API_KEY="sua-api-key-aqui"
```

### Como Usar no Código

#### No Backend (Node.js/Express)
```typescript
// Acessar a API key
const geminiApiKey = process.env.GEMINI_API_KEY;

// Exemplo de uso
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Exemplo de função para gerar texto
async function generateText(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    throw error;
  }
}
```

#### No Frontend (React/TypeScript)
**⚠️ IMPORTANTE:** Nunca exponha a API key diretamente no frontend!

```typescript
// ❌ NUNCA faça isso:
// const apiKey = "AIzaSyC9NTvsfIiwir8phfTOR1gUHYWa3gcdGnA";

// ✅ Faça isso: Chame uma API do seu backend
async function callGeminiAPI(prompt: string) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  
  return response.json();
}
```

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
5. **Configure** limites de uso na Google Cloud Console

## Instalação de Dependências

Para usar o Google Gemini, instale a biblioteca oficial:

```bash
npm install @google/generative-ai
```

## Exemplo de Endpoint no Backend

```typescript
// server/routes.ts ou arquivo similar
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Validar entrada
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt inválido' });
    }
    
    // Limitar tamanho do prompt
    if (prompt.length > 1000) {
      return res.status(400).json({ error: 'Prompt muito longo' });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ text });
  } catch (error) {
    console.error('Erro na API Gemini:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

## Monitoramento de Uso

Monitore o uso da API no [Google Cloud Console](https://console.cloud.google.com/) para:
- Verificar quotas
- Monitorar custos
- Configurar alertas
- Revisar logs de uso

## 📚 Documentação Adicional

Para configuração e uso da **OpenAI GPT**, consulte: `OPENAI_API_SETUP.md`

---

Consulte este arquivo para exemplos detalhados de implementação do Gemini!