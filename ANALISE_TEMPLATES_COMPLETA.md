# ANÁLISE DOS TEMPLATES DE IMPORTAÇÃO/EXPORTAÇÃO

## 📊 COMPARAÇÃO: TEMPLATE vs SCHEMA

### ✅ EQUIPAMENTOS - ANÁLISE DETALHADA

#### Campos do Schema (equipamentos):
- numeroSerie ✅ (Número de Série)
- tag ✅ (TAG*)  
- nome ✅ (Nome*)
- tipo ✅ (Tipo*)
- modelo ✅ (Modelo)
- fabricante ✅ (Fabricante)
- unidadeMedida ✅ (Unidade Medição)
- resolucao ✅ (Resolução)
- faixaMinEquipamento ❌ (AUSENTE)
- faixaMaxEquipamento ❌ (AUSENTE)
- faixaMinPam ❌ (AUSENTE)
- faixaMaxPam ❌ (AUSENTE)
- faixaMinCalibrada ❌ (AUSENTE)
- faixaMaxCalibrada ❌ (AUSENTE)
- condicoesAmbientaisOperacao ❌ (AUSENTE)
- softwareVersao ❌ (AUSENTE)
- instalacaoId ✅ (Instalação ID*)
- poloId ✅ (Polo ID*)
- classificacao ❌ (AUSENTE)
- frequenciaCalibracao ✅ (Frequência Calibração)
- ativoMxm ❌ (AUSENTE)
- planoManutencao ❌ (AUSENTE)
- criterioAceitacao ❌ (AUSENTE)
- erroMaximoAdmissivel ❌ (AUSENTE)
- statusOperacional ✅ (Status Operacional*)
- status ❌ (AUSENTE - diferente de statusOperacional)

#### Campos do Template NÃO no Schema:
- campoId ❌ (Campo ID - não existe diretamente no schema equipamentos)
- area ❌ (Área - não existe no schema)
- localizacaoEspecifica ❌ (Localização Específica - não existe no schema)
- faixaOperacional ❌ (pode ser uma versão simplificada das faixas do schema)
- classeExatidao ❌ (Classe Exatidão - não existe no schema)
- incertezaMedicao ❌ (Incerteza Medição - não existe no schema)
- rangeabilidade ❌ (Rangeabilidade - não existe no schema)
- vazaoNominal ❌ (Vazão Nominal - não existe no schema)
- pressaoMaxima ❌ (Pressão Máxima - não existe no schema)
- temperaturaMaxima ❌ (Temperatura Máxima - não existe no schema)
- materialConstrucao ❌ (Material Construção - não existe no schema)
- dataUltimaCalibracao ❌ (deve vir de outra tabela)
- dataProximaCalibracao ❌ (deve vir de outra tabela)
- periodicidadeAnp ❌ (deve vir de outra tabela)
- laboratorioCalibracao ❌ (deve vir de outra tabela)
- statusMetrologico ❌ (deve vir de outra tabela)
- criticidade ❌ (não existe no schema)
- observacoes ❌ (não existe no schema)

## 🎯 RECOMENDAÇÕES CRÍTICAS:

### 1. CAMPOS IMPORTANTES AUSENTES NO TEMPLATE:
- **faixaMinEquipamento / faixaMaxEquipamento**: Fundamentais para especificação técnica
- **classificacao**: Campo importante para organização
- **softwareVersao**: Importante para rastreabilidade
- **erroMaximoAdmissivel**: Crítico para metrologia
- **status**: Campo diferente de statusOperacional

### 2. CAMPOS DO TEMPLATE QUE NÃO EXISTEM NO SCHEMA:
- Muitos campos parecem ser de outras tabelas (calibração, pontos de medição)
- Alguns campos podem precisar ser adicionados ao schema se são importantes

### 3. AÇÕES RECOMENDADAS:
1. **Atualizar template** para incluir campos ausentes do schema
2. **Revisar schema** para ver se campos do template devem ser adicionados
3. **Validar com usuários** quais campos são realmente necessários
4. **Criar templates específicos** para cada tabela relacionada

## ⚠️ IMPACTO NA PRODUÇÃO:
- Templates atuais podem não capturar todos os dados necessários
- Importações podem perder informações importantes
- Recomendo **revisar antes do uso em produção**