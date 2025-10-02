## 🎯 TEMPLATE ATUALIZADO PARA EQUIPAMENTOS

Baseado na análise, aqui está o template corrigido para incluir todos os campos importantes do schema:

```typescript
export const EQUIPAMENTOS_TEMPLATE_COMPLETO = {
  name: "Equipamentos",
  headers: [
    // Identificação Básica
    "TAG*", "Nome*", "Tipo*", "Fabricante", "Modelo", "Número de Série",

    // Localização
    "Polo ID*", "Instalação ID*", 

    // Características Técnicas do Schema
    "Unidade Medida", "Resolução", 
    "Faixa Min Equipamento", "Faixa Max Equipamento",
    "Faixa Min PAM", "Faixa Max PAM", 
    "Faixa Min Calibrada", "Faixa Max Calibrada",
    "Condições Ambientais Operação", "Software Versão",
    "Classificação", "Erro Máximo Admissível",

    // Calibração (da tabela execucaoCalibracoes)
    "Frequência Calibração ANP", "Ativo MXM", "Plano Manutenção",
    "Critério Aceitação",

    // Status
    "Status Operacional*", "Status Equipamento*",

    // Observações
    "Observações"
  ],

  fieldMapping: {
    "TAG*": "tag",
    "Nome*": "nome", 
    "Tipo*": "tipo",
    "Fabricante": "fabricante",
    "Modelo": "modelo",
    "Número de Série": "numeroSerie",
    "Polo ID*": "poloId",
    "Instalação ID*": "instalacaoId",
    "Unidade Medida": "unidadeMedida",
    "Resolução": "resolucao",
    "Faixa Min Equipamento": "faixaMinEquipamento",
    "Faixa Max Equipamento": "faixaMaxEquipamento", 
    "Faixa Min PAM": "faixaMinPam",
    "Faixa Max PAM": "faixaMaxPam",
    "Faixa Min Calibrada": "faixaMinCalibrada",
    "Faixa Max Calibrada": "faixaMaxCalibrada",
    "Condições Ambientais Operação": "condicoesAmbientaisOperacao",
    "Software Versão": "softwareVersao",
    "Classificação": "classificacao",
    "Frequência Calibração ANP": "frequenciaCalibracao",
    "Ativo MXM": "ativoMxm",
    "Plano Manutenção": "planoManutencao",
    "Critério Aceitação": "criterioAceitacao",
    "Erro Máximo Admissível": "erroMaximoAdmissivel",
    "Status Operacional*": "statusOperacional",
    "Status Equipamento*": "status",
    "Observações": "observacoes"
  }
};
```

## 📋 RECOMENDAÇÃO FINAL:

**Para usar em produção:**

1. ✅ **Use os templates atuais** para começar - eles têm os campos básicos
2. 🔧 **Planeje atualização** dos templates com campos ausentes conforme necessidade
3. ⚠️ **Teste sempre** a importação com dados reais antes de usar em massa
4. 📊 **Monitore** quais campos são mais utilizados pelos usuários

**Os templates atuais são funcionais para uso básico, mas podem ser expandidos conforme a necessidade dos usuários em produção!**