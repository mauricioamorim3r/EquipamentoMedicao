# 🚀 Guia de Deploy no Render - SGM Sistema de Gestão Metrológica

## 📋 Pré-requisitos

1. **Conta no Render**: [https://render.com](https://render.com)
2. **Repositório Git**: Código no GitHub/GitLab/Bitbucket
3. **Banco PostgreSQL**: Configure um banco PostgreSQL no Render

## 🗄️ 1. Configurar Banco de Dados

### 1.1 Criar PostgreSQL Database no Render
1. Acesse o dashboard do Render
2. Clique em "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `sgm-database`
   - **Database**: `sgm_production`
   - **User**: `sgm_user`
   - **Region**: Escolha a mais próxima
   - **PostgreSQL Version**: 15 (recomendado)
   - **Plan**: Free (para testes) ou Paid (produção)

### 1.2 Obter URL de Conexão
Após criar o banco, copie a **External Database URL** que será algo como:
```
postgresql://sgm_user:password@hostname:5432/sgm_production
```

## 🌐 2. Deploy da Aplicação Web

### 2.1 Criar Web Service
1. No dashboard do Render, clique em "New +" → "Web Service"
2. Conecte seu repositório Git
3. Configure:

**Configurações Básicas:**
- **Name**: `sgm-sistema-gestao-metrologica`
- **Region**: Mesma região do banco de dados
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 2.2 Configurar Variáveis de Ambiente

Vá em "Environment" e adicione as seguintes variáveis:

```bash
# Ambiente
NODE_ENV=production
PORT=10000

# URL da aplicação (será fornecida pelo Render)
APP_URL=https://sgm-sistema-gestao-metrologica.onrender.com

# Banco de dados (cole a URL obtida no passo 1.2)
DATABASE_URL=postgresql://sgm_user:password@hostname:5432/sgm_production

# Segurança
SESSION_SECRET=your-super-secure-session-secret-change-this

# CORS (opcional)
CORS_ORIGIN=https://sgm-sistema-gestao-metrologica.onrender.com

# Upload (opcional)
MAX_FILE_SIZE=10mb
UPLOAD_DIR=uploads

# Log
LOG_LEVEL=info
```

### 2.3 Configurações Avançadas

**Auto-Deploy**: ✅ Habilitado
**Health Check Path**: `/api/health`

## 🔧 3. Configurações do Projeto

### 3.1 Arquivo render.yaml (Opcional)
O projeto já inclui um arquivo `render.yaml` para configuração automática.

### 3.2 Scripts do Package.json
Verificar se os scripts estão configurados:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "node dist/index.js",
    "postbuild": "npm run db:push"
  }
}
```

## 🚀 4. Processo de Deploy

### 4.1 Primeiro Deploy
1. Configure todas as variáveis de ambiente
2. Clique em "Create Web Service"
3. O Render irá:
   - Clonar o repositório
   - Instalar dependências (`npm install`)
   - Executar o build (`npm run build`)
   - Aplicar migrações do banco (`npm run db:push`)
   - Iniciar a aplicação (`npm start`)

### 4.2 Monitoramento
- **Logs**: Acompanhe os logs em tempo real no dashboard
- **Health Check**: O endpoint `/api/health` será verificado automaticamente
- **Métricas**: CPU, memória e outros recursos são monitorados

## 🔍 5. Troubleshooting

### Problemas Comuns

**1. Erro de Build**
```bash
# Verifique se todas as dependências estão no package.json
npm install
npm run build
```

**2. Erro de Banco de Dados**
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco PostgreSQL está rodando
- Teste a conexão localmente primeiro

**3. Erro de Porta**
- O Render usa a variável `PORT` automaticamente
- Certifique-se que o servidor está escutando em `process.env.PORT`

**4. Assets Não Carregam**
- Verifique se os arquivos estão sendo servidos corretamente
- Confirme se o build gerou os arquivos em `dist/public`

### Logs Úteis
```bash
# Ver logs da aplicação
curl https://your-app.onrender.com/api/health

# Testar localmente antes do deploy
npm run build
npm start
```

## 📈 6. Otimizações para Produção

### 6.1 Performance
- Build otimizado com code splitting
- Compressão gzip automática no Render
- Cache de assets estáticos

### 6.2 Monitoramento
- Health check em `/api/health`
- Logs estruturados
- Métricas de performance

### 6.3 Segurança
- HTTPS automático
- Variáveis de ambiente seguras
- CORS configurado

## 🔄 7. Atualizações

### Deploy Automático
- Commits na branch `main` fazem deploy automático
- Rollback disponível no dashboard do Render

### Deploy Manual
1. Vá no dashboard do Render
2. Selecione seu serviço
3. Clique em "Manual Deploy"

## 📞 8. Suporte

**Documentação Render**: [https://render.com/docs](https://render.com/docs)
**Status Page**: [https://status.render.com](https://status.render.com)

## ✅ Checklist Final

- [ ] Banco PostgreSQL criado e configurado
- [ ] Variáveis de ambiente configuradas
- [ ] `DATABASE_URL` testada e funcionando
- [ ] `SESSION_SECRET` definido
- [ ] `APP_URL` configurada
- [ ] Health check funcionando
- [ ] Build executando sem erros
- [ ] Aplicação acessível na URL do Render

---

**🎉 Parabéns! Sua aplicação SGM está rodando em produção no Render!**

Acesse: `https://sgm-sistema-gestao-metrologica.onrender.com`