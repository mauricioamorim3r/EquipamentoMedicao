# 🧹 Guia de Limpeza de Cache e Dados Mock

## Visão Geral

Este documento explica como limpar caches, dados simulados e storages do Sistema de Gestão de Medição (SGM).

---

## 📋 Tipos de Cache/Dados no Sistema

### 1. **Cache do Navegador (Browser)**
- **Service Workers**: PWA cache para funcionamento offline
- **Cache API**: Armazena assets estáticos e respostas de API
- **LocalStorage**: Preferências do usuário (idioma, configurações de notificações)
- **SessionStorage**: Dados temporários da sessão

### 2. **Dados de Teste/Mock (Backend)**
- Notificações de exemplo
- Endpoint `/api/notificacoes/create-samples` (desabilitado)

### 3. **Dados de Produção (Seed Data)**
- Polos, Campos, Instalações
- Equipamentos básicos
- **⚠️ NÃO são removidos automaticamente**

---

## 🛠️ Métodos de Limpeza

### Método 1: Limpeza via Interface HTML

1. Abra o arquivo `clear-cache.html` no navegador:
   ```
   file:///C:/appsMau/EquipamentoMedicao-1/clear-cache.html
   ```

2. Use os botões disponíveis:
   - **🗑️ Limpar Todo Cache**: Remove todos os caches do Service Worker
   - **🔄 Limpar Service Worker**: Remove registros de Service Worker
   - **📦 Limpar LocalStorage**: Remove preferências salvas
   - **🔐 Limpar SessionStorage**: Remove dados da sessão
   - **⚡ LIMPAR TUDO**: Executa todas as limpezas acima

3. Após a limpeza, recarregue a página com `Ctrl+F5` ou `Ctrl+Shift+R`

### Método 2: Limpeza via Terminal (Backend)

Execute o comando no terminal:

```bash
npm run clear-cache
```

**O que este comando faz:**
- Remove todas as notificações de teste do banco de dados
- Mantém os dados de produção intactos
- Exibe relatório do que foi removido

**Saída esperada:**
```
🧹 LIMPANDO DADOS DE TESTE E MOCK
══════════════════════════════════════════════════
📋 Limpando notificações de teste...
✅ X notificações removidas
══════════════════════════════════════════════════
✅ LIMPEZA CONCLUÍDA COM SUCESSO!
```

### Método 3: Limpeza Manual via DevTools

1. Abra o navegador (Chrome/Edge)
2. Pressione `F12` para abrir DevTools
3. Vá para a aba **Application**
4. No menu lateral:
   - **Service Workers** → Clique em "Unregister"
   - **Cache Storage** → Clique com botão direito e "Delete"
   - **Local Storage** → Clique com botão direito e "Clear"
   - **Session Storage** → Clique com botão direito e "Clear"
5. Recarregue a página com `Ctrl+F5`

### Método 4: Limpeza via Console do Navegador

Abra o Console (`F12` → Console) e execute:

```javascript
// Limpar todos os caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
  console.log('✅ Caches limpos');
});

// Limpar Service Workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('✅ Service Workers removidos');
});

// Limpar storages
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storages limpos');

// Recarregar
location.reload();
```

---

## 🎯 Quando Limpar o Cache?

### Limpe o cache do navegador quando:
- ✅ Após fazer deploy de nova versão
- ✅ Interface não reflete mudanças recentes no código
- ✅ Erros de "chunk failed" ou "module not found"
- ✅ Comportamento inconsistente da aplicação
- ✅ Dados desatualizados sendo exibidos

### Limpe dados mock do backend quando:
- ✅ Antes de ir para produção
- ✅ Testar o sistema com dados reais
- ✅ Notificações de teste estão poluindo o sistema

### **NÃO** limpe quando:
- ❌ Sistema funcionando normalmente
- ❌ Quiser manter preferências do usuário (idioma, etc.)

---

## 🔍 Verificação Pós-Limpeza

### Frontend (Navegador)

Execute no Console do navegador:

```javascript
// Verificar caches
caches.keys().then(names => console.log('Caches:', names));

// Verificar Service Workers
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('Service Workers:', regs.length));

// Verificar LocalStorage
console.log('LocalStorage keys:', Object.keys(localStorage));

// Verificar SessionStorage
console.log('SessionStorage keys:', Object.keys(sessionStorage));
```

**Resultado esperado após limpeza:**
```
Caches: []
Service Workers: 0
LocalStorage keys: []
SessionStorage keys: []
```

### Backend (Banco de Dados)

Execute o script de verificação:

```bash
tsx server/scripts/verificar-status.ts
```

Ou consulte diretamente o banco via SQL:

```sql
-- Verificar notificações
SELECT COUNT(*) FROM sistema_notificacoes;

-- Deve retornar 0 se não houver notificações
```

---

## 📦 Dados que Permanecem Após Limpeza

### ✅ Dados Preservados (Produção):
- Polos (Búzios, Marlim, 3R)
- Campos associados
- Instalações (FPSO, Plataformas)
- Equipamentos principais
- Calibrações registradas
- Certificados emitidos
- Históricos de manutenção
- Análises químicas
- Testes de poços

### ❌ Dados Removidos (Mock/Cache):
- Notificações de teste
- Cache do Service Worker
- Preferências temporárias do usuário
- Dados de sessão
- Assets estáticos em cache

---

## 🚨 Limpeza Completa do Banco (CUIDADO!)

**⚠️ ATENÇÃO: Isso remove TODOS os dados, incluindo produção!**

Apenas use se precisar resetar completamente o banco:

```bash
# 1. Recriar schema (remove todas as tabelas e dados)
npm run db:push

# 2. Popular novamente com dados iniciais
tsx server/scripts/seed-data.ts
```

---

## 🔧 Scripts Disponíveis

### Comandos NPM:
```bash
npm run clear-cache        # Limpar dados mock do backend
npm run dev               # Reiniciar servidor de desenvolvimento
npm run db:push           # Recriar schema do banco
```

### Scripts TypeScript:
```bash
tsx server/scripts/limpar-dados-teste.ts    # Limpar dados de teste
tsx server/scripts/seed-data.ts             # Popular dados iniciais
tsx server/scripts/verificar-status.ts      # Verificar status do sistema
```

---

## 📝 Notas Importantes

1. **Cache do Service Worker**: É automaticamente recriado quando você acessa a aplicação novamente
2. **LocalStorage**: Armazena apenas preferências do usuário (idioma, configurações de notificações)
3. **Dados de Produção**: Nunca são removidos pelos comandos de limpeza de cache
4. **Hard Reload**: Sempre use `Ctrl+F5` ou `Ctrl+Shift+R` após limpar cache

---

## 🐛 Troubleshooting

### Problema: "O cache continua voltando"
**Solução:** O Service Worker está sendo reativado. Desregistre completamente:
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
```

### Problema: "Dados continuam aparecendo após limpeza"
**Solução:** São dados de produção (seed data), não dados mock. Para remover, execute:
```bash
npm run db:push  # CUIDADO: Remove tudo!
```

### Problema: "Erro ao executar npm run clear-cache"
**Solução:** Verifique se o banco de dados está acessível:
```bash
# Verificar conexão
tsx test-db-connection.js
```

---

## 📚 Recursos Adicionais

- **Service Worker**: `client/public/sw-enhanced.js`, `client/public/sw.js`
- **Script de Limpeza**: `server/scripts/limpar-dados-teste.ts`
- **Interface HTML**: `clear-cache.html`
- **Seed Data**: `server/scripts/seed-data.ts`

---

**Última atualização:** Outubro 2025
**Versão do Sistema:** 2.1.0

