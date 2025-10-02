# Render MCP Setup - Instruções

## ✅ O que já fizemos:
1. **Correções SSL**: Configuramos SSL para conexões PostgreSQL no Render
2. **Deploy GitHub**: Enviamos todas as correções para o GitHub
3. **Auto-deploy**: O Render deve estar processando as mudanças automaticamente

## 🔧 Configuração do Render MCP Server

O Render possui um servidor MCP oficial hospedado que permite gerenciar recursos do Render diretamente através de comandos de linguagem natural em clientes como Claude Desktop, Cursor, etc.

### 📋 Passos para configurar:

#### 1. Criar API Key no Render
1. Acesse: https://dashboard.render.com/settings#api-keys
2. Clique em "Create API Key"
3. Dê um nome (ex: "MCP Access")
4. Copie a chave gerada

#### 2. Configurar Cliente MCP
O arquivo `render-mcp-config.json` foi criado como exemplo. 

**Para Claude Desktop**, adicione ao `~/.claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer <SUA_API_KEY_AQUI>"
      }
    }
  }
}
```

**Para Cursor**, adicione ao `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer <SUA_API_KEY_AQUI>"
      }
    }
  }
}
```

#### 3. Definir Workspace
Após configurar, use um comando como:
```
Set my Render workspace to [NOME_DO_WORKSPACE]
```

## 🚀 Exemplos de comandos após configurar:

### Verificar serviços:
- "List my Render services"
- "Show details of my EquipamentoMedicao service"

### Consultar banco de dados:
- "Query my database for equipment count"  
- "Show recent equipment registrations"

### Verificar logs e métricas:
- "Show recent logs for my service"
- "What was the busiest traffic day this month?"

### Solução de problemas:
- "Why isn't my site working?"
- "Pull the most recent error logs"

## 📊 Status atual do deploy:
- ✅ Código enviado para GitHub
- 🔄 Auto-deploy em progresso no Render
- ✅ Configurações SSL implementadas
- ✅ Dependencies atualizadas

## 🔗 Links úteis:
- Dashboard Render: https://dashboard.render.com
- Documentação MCP: https://render.com/docs/mcp-server
- API Keys: https://dashboard.render.com/settings#api-keys

---

**Próximos passos:**
1. Criar API key no Render
2. Configurar cliente MCP (Claude/Cursor)
3. Definir workspace
4. Começar a usar comandos naturais para gerenciar o deploy!