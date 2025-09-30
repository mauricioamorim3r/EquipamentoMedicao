# 🗄️ Configuração Neon Database - SGM

## 📋 Checklist de Setup

### ✅ Passo 1: Criar Conta Neon
- [ ] Acessar https://neon.tech
- [ ] Criar conta (GitHub recomendado)
- [ ] Selecionar plano Free

### ✅ Passo 2: Criar Projeto
- [ ] Nome: `SGM-Database`
- [ ] Região: `US East (Ohio)`
- [ ] PostgreSQL: `16`
- [ ] Database: `sgm_production`

### ✅ Passo 3: Obter Connection String
- [ ] Dashboard → Connect
- [ ] Copiar connection string completa
- [ ] Formato: `postgresql://user:pass@host/db?sslmode=require`

### ✅ Passo 4: Configurar no Projeto
- [ ] Atualizar `.env` com DATABASE_URL real
- [ ] Executar `npm run db:push`
- [ ] Testar aplicação

## 🔧 Comandos Importantes

```bash
# Aplicar schema no banco
npm run db:push

# Verificar status das migrações
npx drizzle-kit push --verbose

# Executar aplicação
npm run dev
```

## 📊 Schema do SGM

O sistema criará automaticamente as seguintes tabelas:
- `polos` - Polos de produção
- `instalacoes` - Instalações por polo
- `equipamentos` - Equipamentos de medição
- `calibracoes` - Histórico de calibrações
- `cadastro_poco` - Cadastro de poços
- `testes_pocos` - Testes BTP dos poços
- `placas_orificio` - Placas de orifício
- `planos_coleta` - Planos de coleta química

## 🎯 Recursos Neon Incluídos

- ✅ **Backup automático** diário
- ✅ **Branching** para desenvolvimento
- ✅ **Connection pooling** otimizado
- ✅ **SSL** automático
- ✅ **Monitoramento** integrado
- ✅ **Scaling** automático

## 🔒 Segurança

- Connection string contém credenciais sensíveis
- Nunca commitar `.env` no git
- Usar variáveis de ambiente em produção

## 📈 Limites Plano Free

- **Storage**: 512MB (suficiente para SGM)
- **Transfer**: 3GB/mês
- **Compute**: 100 horas/mês
- **Databases**: 10 por projeto

## 🆘 Troubleshooting

### Erro de conexão:
```bash
# Verificar se DATABASE_URL está configurada
echo $DATABASE_URL

# Testar conexão
npm run db:push
```

### Erro de SSL:
- Sempre incluir `?sslmode=require` na URL
- Neon requer SSL obrigatório

### Erro de schema:
```bash
# Recriar schema
npx drizzle-kit push --force
```