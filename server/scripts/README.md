# Scripts de Desenvolvimento Movidos

## 📁 Organização do Código

Os scripts de desenvolvimento e análise foram movidos para `server/scripts/` para manter o código principal limpo e sem erros de compilação.

## 📋 Scripts Disponíveis

### Scripts de Análise:
- `verificar-status.ts` - Análise completa do status da base de dados
- `relatorio-status-final.ts` - Relatório executivo com estatísticas
- `verificar-placas-detalhadas.ts` - Análise detalhada das placas de orifício
- `verificar-placas.ts` - Verificação básica de placas

### Scripts de População de Dados:
- `inserir-placas-ajustadas.ts` - Inserção de placas com dados ajustados
- `recriar-placas.ts` - Recriação de dados de placas
- `seed-data.ts` - População inicial de dados
- `seed-placas-orificio.ts` - Dados específicos de placas
- `seed-3r2.ts` - Script de seed personalizado

## 🚀 Como Executar

Para executar qualquer script:

```bash
cd server/scripts
npx tsx nome-do-script.ts
```

## ⚠️ Nota Importante

Estes scripts são **utilitários de desenvolvimento** e não fazem parte da aplicação principal. Eles foram movidos para:

1. ✅ **Eliminar erros de compilação** no build principal
2. ✅ **Organizar melhor** o código
3. ✅ **Manter funcionalidades** de análise disponíveis
4. ✅ **Separar responsabilidades** entre aplicação e ferramentas

## 🎯 Sistema Principal

O sistema principal permanece **100% funcional** com:
- ✅ Zero erros de compilação
- ✅ Todas as funcionalidades CRUD
- ✅ Dashboards operacionais
- ✅ Sistema de alertas ativo