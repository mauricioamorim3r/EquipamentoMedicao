# 🔄 Guia de Versionamento e Cache - SGM

## 📋 Visão Geral

Este guia explica como manter apenas a versão mais atual da aplicação após deploy, garantindo que usuários não vejam caches antigos ou versões desatualizadas.

---

## 🎯 Estratégia de Versionamento

### 1. **Versionamento Automático**
- **Service Workers**: Atualizados automaticamente a cada build
- **Cache Busting**: Assets com hash único para evitar cache
- **Headers HTTP**: Configurados para controle preciso de cache

### 2. **Limpeza Automática de Cache**
- Service Workers antigos são removidos automaticamente
- Caches obsoletos são limpos na ativação
- Versionamento baseado em timestamp para unicidade

---

## 🛠️ Implementação Técnica

### Headers de Cache Configurados

```javascript
// HTML - Sem cache (sempre busca versão mais recente)
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0

// Assets estáticos - Cache longo com versionamento
Cache-Control: public, max-age=31536000, immutable

// Service Workers - Sem cache
Cache-Control: no-cache, no-store, must-revalidate
```

### Service Worker Versioning

```javascript
// Versão atualizada automaticamente
const VERSION = 'v3'; // Atualizada a cada build
const CACHE_NAME = `sgm-equipamento-medicao-${VERSION}`;

// Limpeza automática de caches antigos
if (cacheName.startsWith('sgm-') && !cacheName.includes(VERSION)) {
  return caches.delete(cacheName);
}
```

### Build com Cache Busting

```javascript
// Vite config - Hash único para cada asset
output: {
  entryFileNames: 'assets/[name]-[hash].js',
  chunkFileNames: 'assets/[name]-[hash].js',
  assetFileNames: 'assets/[name]-[hash].[ext]'
}
```

---

## 🚀 Processo de Deploy

### 1. **Build Automático**
```bash
npm run build
```
**O que acontece:**
1. Atualiza versão dos Service Workers
2. Gera hash único para assets
3. Configura headers de cache
4. Compila aplicação

### 2. **Deploy no Render**
```bash
npm start
```
**Headers aplicados:**
- HTML: Sem cache
- Assets: Cache longo com versionamento
- Service Workers: Sem cache

### 3. **Ativação Automática**
- Service Worker detecta nova versão
- Remove caches antigos automaticamente
- Usuários recebem versão atualizada

---

## 🧹 Limpeza Manual de Cache

### Para Desenvolvedores

```bash
# Limpar dados de teste
npm run clear-cache

# Atualizar versão manualmente
npm run update-version

# Build com nova versão
npm run build
```

### Para Usuários

1. **Interface HTML**: Acesse `/clear-cache.html`
2. **DevTools**: Application → Clear Storage
3. **Console**: Execute comandos de limpeza

---

## 📊 Monitoramento de Versões

### Verificar Versão Atual

```bash
# Ver versão no arquivo VERSION
cat VERSION

# Ver versão dos Service Workers
grep "const VERSION" client/public/sw*.js
```

### Logs de Atualização

```javascript
// Service Worker logs
console.log('SW: Installing...');
console.log('SW: Removing old cache:', cacheName);
console.log('SW: Cache cleanup completed');
```

---

## 🔧 Configurações Avançadas

### Personalizar Versionamento

```typescript
// server/scripts/update-version.ts
function generateNewVersion(): string {
  const now = new Date();
  const timestamp = now.getTime();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  return `v${dateStr}-${timestamp.toString().slice(-6)}`;
}
```

### Headers Customizados

```javascript
// server/vite.ts
setHeaders: (res, path) => {
  if (path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  // ... outros tipos de arquivo
}
```

---

## 🐛 Troubleshooting

### Problema: "Usuários não veem atualizações"

**Soluções:**
1. Verificar se Service Worker está ativo
2. Limpar cache manualmente
3. Verificar headers de cache
4. Forçar reload com `Ctrl+F5`

### Problema: "Cache não limpa automaticamente"

**Soluções:**
1. Verificar versão do Service Worker
2. Executar `npm run update-version`
3. Fazer novo deploy
4. Verificar logs do Service Worker

### Problema: "Assets antigos sendo servidos"

**Soluções:**
1. Verificar se build gerou novos hashes
2. Confirmar headers de cache
3. Limpar cache do CDN (se aplicável)
4. Verificar configuração do servidor

---

## 📈 Benefícios da Implementação

### ✅ **Garantias**
- Apenas versão mais atual é servida
- Cache antigo é removido automaticamente
- Versionamento único por deploy
- Headers otimizados para performance

### ✅ **Experiência do Usuário**
- Atualizações transparentes
- Sem necessidade de limpeza manual
- Performance otimizada
- Funcionamento offline mantido

### ✅ **Manutenção**
- Processo automatizado
- Versionamento consistente
- Logs detalhados
- Troubleshooting simplificado

---

## 📚 Recursos Adicionais

- **Service Workers**: `client/public/sw-enhanced.js`, `client/public/sw.js`
- **Script de Versionamento**: `server/scripts/update-version.ts`
- **Configuração de Cache**: `server/vite.ts`
- **Build Config**: `vite.config.ts`
- **Interface de Limpeza**: `clear-cache.html`

---

**Última atualização:** Janeiro 2025  
**Versão do Sistema:** 3.0.0
