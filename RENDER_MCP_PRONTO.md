# 🚀 Render MCP - Configuração Completa

## ✅ API Key configurada!
Sua API key do Render foi configurada: `rnd_93A5yp7fSpEmfErfTuqI4Q51waqA`

## 📋 Como usar:

### **Para Claude Desktop:**
1. Localize o arquivo de configuração:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. Adicione esta configuração:
```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer rnd_93A5yp7fSpEmfErfTuqI4Q51waqA"
      }
    }
  }
}
```

### **Para Cursor:**
1. Abra o arquivo: `~/.cursor/mcp.json`
2. Adicione a mesma configuração acima

### **Para outros clientes MCP:**
Use o arquivo `render-mcp-config.json` que acabou de ser atualizado como referência.

## 🎯 Primeiros comandos para testar:

### 1. Definir workspace
```
Set my Render workspace to [NOME_DO_SEU_WORKSPACE]
```

### 2. Listar serviços
```
List my Render services
```

### 3. Verificar seu serviço EquipamentoMedicao
```
Show details of my EquipamentoMedicao service
```

### 4. Verificar logs recentes
```
Show recent logs for my service
```

### 5. Consultar banco de dados
```
Query my database to show equipment count
```

### 6. Verificar status do deploy
```
Show deploy history for my service
```

## 🔍 Comandos úteis para debug:

- **Logs de erro:** "Pull the most recent error-level logs for my API service"
- **Métricas:** "What was the busiest traffic day for my service this month?"
- **Status geral:** "Why isn't my site at [sua-url].onrender.com working?"
- **Performance:** "Show CPU and memory usage for my service"

## 🎉 O que você pode fazer agora:

1. **Monitorar o deploy** que está em andamento
2. **Verificar se as correções SSL** funcionaram
3. **Consultar dados** do banco PostgreSQL
4. **Analisar logs** para troubleshooting
5. **Gerenciar variáveis de ambiente**
6. **Criar novos recursos** se necessário

## ⚠️ Importante:
- A API key tem permissões amplas no seu account Render
- Mantenha ela segura e não compartilhe
- O MCP server é hospedado pelo próprio Render, então sempre estará atualizado

---

**🚀 Agora você pode gerenciar todo seu deploy do Render usando linguagem natural no seu cliente AI!**