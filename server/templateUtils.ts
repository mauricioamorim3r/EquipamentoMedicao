import * as XLSX from "xlsx";

/**
 * Template definitions for all entities
 * Each template contains: column headers, example data, validation rules, and field mappings
 */

// ==================== EQUIPAMENTOS TEMPLATE ====================
export const EQUIPAMENTOS_TEMPLATE = {
  name: "Equipamentos",
  headers: [
    // Identificação Básica
    "TAG*", "Nome*", "Tipo*", "Fabricante", "Modelo", "Número de Série",

    // Localização
    "Polo ID*", "Instalação ID*",

    // Características Técnicas (Campos do Schema)
    "Unidade Medida", "Resolução", 
    "Faixa Min Equipamento", "Faixa Max Equipamento",
    "Faixa Min PAM", "Faixa Max PAM",
    "Faixa Min Calibrada", "Faixa Max Calibrada",
    "Condições Ambientais Operação", "Software Versão",
    "Classificação",

    // Calibração e Manutenção
    "Frequência Calibração ANP", "Ativo MXM", "Plano Manutenção",
    "Critério Aceitação", "Erro Máximo Admissível",

    // Status
    "Status Operacional*", "Status*"
  ],

  exampleData: [
    [
      "FT-001", "Medidor de Vazão Turbina", "Medidor de Vazão", "Emerson", "8800C", "AB123456",
      "1", "1",
      "m³/h", "0.1",
      "0", "1000", "0", "1000", "0", "1000",
      "Temperatura: -20°C a +80°C", "v2.1.5",
      "Medição Fiscal",
      "365", "EQ001", "PM-001",
      "±0.5%", "0.3",
      "Em Operação", "ativo"
    ]
  ],

  validations: {
    required: ["TAG*", "Nome*", "Tipo*", "Polo ID*", "Instalação ID*", "Status Operacional*", "Status*"],
    statusOperacionalOptions: ["Em Operação", "Fora de Operação", "Em Calibração", "Em Manutenção", "Fora de Uso", "Sobressalente"],
    statusOptions: ["ativo", "inativo", "manutencao", "descartado"],
    tipoOptions: ["Medidor de Vazão", "Transmissor de Pressão", "Transmissor de Temperatura", "Analisador", "Cromatógrafo", "Densímetro", "Outro"]
  },

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
    "Status*": "status"
  }
};

// ==================== POÇOS TEMPLATE ====================
export const POCOS_TEMPLATE = {
  name: "Poços",
  headers: [
    "Código*", "Nome*", "Código ANP", "Tipo*", "Polo ID*", "Instalação ID*",
    "Campo ID", "Status*", "Frequência Teste (dias)", "Observações"
  ],

  exampleData: [
    ["POC-001", "Poço Produtor 1", "ANP-12345", "produtor", "1", "1", "1", "ativo", "90", "Poço de alta produção"]
  ],

  validations: {
    required: ["Código*", "Nome*", "Tipo*", "Polo ID*", "Instalação ID*", "Status*"],
    tipoOptions: ["produtor", "injetor", "observacao"],
    statusOptions: ["ativo", "inativo", "suspenso", "abandonado"]
  },

  fieldMapping: {
    "Código*": "codigo",
    "Nome*": "nome",
    "Código ANP": "codigoAnp",
    "Tipo*": "tipo",
    "Polo ID*": "poloId",
    "Instalação ID*": "instalacaoId",
    "Campo ID": "campoId",
    "Status*": "status",
    "Frequência Teste (dias)": "frequenciaTesteDias",
    "Observações": "observacoes"
  }
};

// ==================== PLACAS DE ORIFÍCIO TEMPLATE ====================
export const PLACAS_ORIFICIO_TEMPLATE = {
  name: "Placas de Orifício",
  headers: [
    "Equipamento ID*", "Carta Número*", "Diâmetro Orifício (mm)*",
    "Diâmetro Tubulação (mm)*", "Material", "Espessura (mm)",
    "Tipo Tomada", "Beta Ratio", "Data Inspeção", "Status*"
  ],

  exampleData: [
    ["1", "PO-001", "50.8", "100", "Aço Inox 316", "3.2", "flange", "0.508", "2024-01-15", "ativo"]
  ],

  validations: {
    required: ["Equipamento ID*", "Carta Número*", "Diâmetro Orifício (mm)*", "Diâmetro Tubulação (mm)*", "Status*"],
    tipoTomadaOptions: ["flange", "corner", "d_d2", "pipe"],
    statusOptions: ["ativo", "inativo", "manutencao", "descartado"]
  },

  fieldMapping: {
    "Equipamento ID*": "equipamentoId",
    "Carta Número*": "cartaNumero",
    "Diâmetro Orifício (mm)*": "diametroOrificio",
    "Diâmetro Tubulação (mm)*": "diametroTubulacao",
    "Material": "material",
    "Espessura (mm)": "espessura",
    "Tipo Tomada": "tipoTomada",
    "Beta Ratio": "betaRatio",
    "Data Inspeção": "dataInspecao",
    "Status*": "status"
  }
};

// ==================== VÁLVULAS TEMPLATE ====================
export const VALVULAS_TEMPLATE = {
  name: "Válvulas",
  headers: [
    "TAG*", "Equipamento ID*", "Tipo Válvula*", "Fabricante", "Modelo",
    "Tamanho (pol)", "Classe Pressão", "Material Corpo", "Material Sede",
    "Tipo Atuador", "Status*", "Observações"
  ],

  exampleData: [
    ["VLV-001", "1", "controle", "Fisher", "ED", "4", "300", "Aço Carbono", "PTFE", "pneumatico", "ativo", "Válvula de controle de vazão"]
  ],

  validations: {
    required: ["TAG*", "Equipamento ID*", "Tipo Válvula*", "Status*"],
    tipoValvulaOptions: ["controle", "bloqueio", "alivio", "retencao", "esfera", "gaveta", "borboleta"],
    tipoAtuadorOptions: ["pneumatico", "eletrico", "hidraulico", "manual"],
    statusOptions: ["ativo", "inativo", "manutencao"]
  },

  fieldMapping: {
    "TAG*": "tag",
    "Equipamento ID*": "equipamentoId",
    "Tipo Válvula*": "tipoValvula",
    "Fabricante": "fabricante",
    "Modelo": "modelo",
    "Tamanho (pol)": "tamanho",
    "Classe Pressão": "classePressao",
    "Material Corpo": "materialCorpo",
    "Material Sede": "materialSede",
    "Tipo Atuador": "tipoAtuador",
    "Status*": "status",
    "Observações": "observacoes"
  }
};

// ==================== CAMPOS TEMPLATE ====================
export const CAMPOS_TEMPLATE = {
  name: "Campos",
  headers: [
    "Nome*", "Sigla*", "Polo ID*", "Código ANP", "Tipo Produção",
    "Localização", "Status*", "Observações"
  ],

  exampleData: [
    ["Campo Marlim", "MAR", "1", "ANP-CAM-001", "offshore", "Bacia de Campos", "ativo", "Campo de alta produção"]
  ],

  validations: {
    required: ["Nome*", "Sigla*", "Polo ID*", "Status*"],
    tipoProducaoOptions: ["onshore", "offshore"],
    statusOptions: ["ativo", "inativo", "em_desenvolvimento"]
  },

  fieldMapping: {
    "Nome*": "nome",
    "Sigla*": "sigla",
    "Polo ID*": "poloId",
    "Código ANP": "codigoAnp",
    "Tipo Produção": "tipoProducao",
    "Localização": "localizacao",
    "Status*": "status",
    "Observações": "observacoes"
  }
};

/**
 * Generate Excel template with instructions sheet
 */
export function generateTemplate(template: any) {
  const workbook = XLSX.utils.book_new();

  // Instructions Sheet
  const instructions = [
    ["INSTRUÇÕES DE PREENCHIMENTO"],
    [""],
    [`Template para importação de ${template.name}`],
    [""],
    ["IMPORTANTE:"],
    ["- Campos com * são obrigatórios"],
    ["- Não altere os nomes das colunas"],
    ["- Mantenha o formato das datas: AAAA-MM-DD"],
    ["- IDs devem corresponder a registros existentes"],
    ["- Preencha a partir da linha 2 da aba 'Dados'"],
    [""],
    ["VALORES VÁLIDOS:"]
  ];

  // Add validation options
  Object.entries(template.validations).forEach(([key, value]: [string, any]) => {
    if (Array.isArray(value)) {
      instructions.push([`${key}: ${value.join(", ")}`]);
    }
  });

  instructions.push([""], ["EXEMPLO:"], ["Veja a aba 'Exemplo' para referência"]);

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, wsInstructions, "Instruções");

  // Data Sheet (empty for import)
  const wsData = XLSX.utils.aoa_to_sheet([template.headers]);
  XLSX.utils.book_append_sheet(workbook, wsData, "Dados");

  // Example Sheet
  const wsExample = XLSX.utils.aoa_to_sheet([template.headers, ...template.exampleData]);
  XLSX.utils.book_append_sheet(workbook, wsExample, "Exemplo");

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}

/**
 * Parse imported Excel file
 */
export function parseImportedFile(buffer: Buffer, template: any) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames.find(name => name === "Dados") || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

  // Transform data using field mapping
  const transformedData = rawData.map((row, index) => {
    const mappedRow: any = {};
    const errors: string[] = [];

    // Map fields
    Object.entries(template.fieldMapping).forEach(([excelCol, dbField]: [string, any]) => {
      const value = row[excelCol];

      // Check required fields
      if (excelCol.includes("*") && (value === undefined || value === null || value === "")) {
        errors.push(`Campo obrigatório '${excelCol}' não preenchido`);
      }

      // Convert types
      if (dbField.includes("Id") && value) {
        mappedRow[dbField] = parseInt(value);
      } else if (dbField.includes("data") || dbField.includes("Data")) {
        mappedRow[dbField] = value ? new Date(value) : null;
      } else {
        mappedRow[dbField] = value;
      }
    });

    return {
      row: index + 2, // Excel row number
      data: mappedRow,
      errors,
      isValid: errors.length === 0
    };
  });

  return {
    total: transformedData.length,
    valid: transformedData.filter(d => d.isValid).length,
    invalid: transformedData.filter(d => !d.isValid).length,
    data: transformedData
  };
}

// ==================== TRECHOS RETOS TEMPLATE ====================
export const TRECHOS_RETOS_TEMPLATE = {
  name: "Trechos Retos",
  headers: [
    "TAG*", "Equipamento ID*", "Campo ID", "Instalação ID*",
    "Tipo Trecho*", "Comprimento Montante (D)", "Comprimento Jusante (D)",
    "Diâmetro Nominal (mm)*", "Material", "Tipo Tomada", "Beta Ratio",
    "Retificador Fluxo", "Status*", "Observações"
  ],

  exampleData: [
    ["TR-001", "1", "1", "1", "reto", "20", "5", "100", "Aço Carbono", "flange", "0.6", "sim", "conforme", "Trecho reto conforme ISO 5167"]
  ],

  validations: {
    required: ["TAG*", "Equipamento ID*", "Instalação ID*", "Tipo Trecho*", "Diâmetro Nominal (mm)*", "Status*"],
    tipoTrechoOptions: ["reto", "curva", "reducao", "expansao"],
    statusOptions: ["conforme", "nao_conforme", "em_analise"],
    retificadorFluxoOptions: ["sim", "nao"]
  },

  fieldMapping: {
    "TAG*": "tag",
    "Equipamento ID*": "equipamentoId",
    "Campo ID": "campoId",
    "Instalação ID*": "instalacaoId",
    "Tipo Trecho*": "tipoTrecho",
    "Comprimento Montante (D)": "comprimentoMontante",
    "Comprimento Jusante (D)": "comprimentoJusante",
    "Diâmetro Nominal (mm)*": "diametroNominal",
    "Material": "material",
    "Tipo Tomada": "tipoTomada",
    "Beta Ratio": "betaRatio",
    "Retificador Fluxo": "retificadorFluxo",
    "Status*": "statusConformidade",
    "Observações": "observacoes"
  }
};

// ==================== ANÁLISES QUÍMICAS TEMPLATE ====================
export const ANALISES_QUIMICAS_TEMPLATE = {
  name: "Análises Químicas",
  headers: [
    "Plano Coleta ID*", "Ponto Medição ID*", "Data Coleta*", "Data Análise",
    "Densidade (kg/m³)", "Poder Calorífico (kcal/kg)", "Teor CO2 (%)",
    "Teor H2S (ppm)", "Teor N2 (%)", "Teor C1 (%)", "Teor C2 (%)",
    "Teor C3 (%)", "Viscosidade (cP)", "Laboratório", "Status Análise*",
    "Observações"
  ],

  exampleData: [
    ["1", "1", "2024-01-15", "2024-01-18", "0.82", "9500", "1.5", "5", "2.1", "85.5", "8.3", "3.2", "0.35", "Labcal", "concluido", "Análise dentro dos padrões"]
  ],

  validations: {
    required: ["Plano Coleta ID*", "Ponto Medição ID*", "Data Coleta*", "Status Análise*"],
    statusAnaliseOptions: ["pendente", "coletado", "laboratorio", "concluido", "rejeitado"]
  },

  fieldMapping: {
    "Plano Coleta ID*": "planoColetaId",
    "Ponto Medição ID*": "pontoMedicaoId",
    "Data Coleta*": "dataColeta",
    "Data Análise": "dataAnalise",
    "Densidade (kg/m³)": "densidade",
    "Poder Calorífico (kcal/kg)": "poderCalorifico",
    "Teor CO2 (%)": "teorCo2",
    "Teor H2S (ppm)": "teorH2s",
    "Teor N2 (%)": "teorN2",
    "Teor C1 (%)": "teorC1",
    "Teor C2 (%)": "teorC2",
    "Teor C3 (%)": "teorC3",
    "Viscosidade (cP)": "viscosidade",
    "Laboratório": "laboratorio",
    "Status Análise*": "statusAnalise",
    "Observações": "observacoes"
  }
};

// ==================== CONTROLE DE INCERTEZAS TEMPLATE ====================
export const CONTROLE_INCERTEZAS_TEMPLATE = {
  name: "Controle de Incertezas",
  headers: [
    "Ponto Medição ID*", "Polo ID", "Instalação ID", "TAG Ponto*",
    "Data Execução*", "Número Certificado", "Vazão Volumétrica (m³/h)",
    "Incerteza Expandida", "Incerteza Expandida Relativa (%)*",
    "Critério Aceitação (%)*", "Classificação*", "Resultado*",
    "Conforme Limite", "Status*", "Observação"
  ],

  exampleData: [
    ["1", "1", "1", "PM-001", "2024-01-15", "CERT-2024-001", "500", "0.5", "0.3", "0.5", "fiscal", "aprovado", "true", "concluido", "Incerteza dentro dos limites ANP"]
  ],

  validations: {
    required: ["Ponto Medição ID*", "TAG Ponto*", "Data Execução*", "Incerteza Expandida Relativa (%)*", "Critério Aceitação (%)*", "Classificação*", "Resultado*", "Status*"],
    classificacaoOptions: ["fiscal", "apropriacao", "operacional"],
    resultadoOptions: ["aprovado", "reprovado", "condicional"],
    statusOptions: ["pendente", "em_analise", "concluido", "rejeitado"],
    conformeLimiteOptions: ["true", "false"]
  },

  fieldMapping: {
    "Ponto Medição ID*": "pontoMedicaoId",
    "Polo ID": "poloId",
    "Instalação ID": "instalacaoId",
    "TAG Ponto*": "tagPontoInstalacao",
    "Data Execução*": "dataExecucao",
    "Número Certificado": "numeroCertificado",
    "Vazão Volumétrica (m³/h)": "vazaoVolumetrica",
    "Incerteza Expandida": "incertezaExpandida",
    "Incerteza Expandida Relativa (%)*": "incertezaExpandidaRelativa",
    "Critério Aceitação (%)*": "criterioAceitacao",
    "Classificação*": "classificacao",
    "Resultado*": "resultado",
    "Conforme Limite": "conformeLimite",
    "Status*": "status",
    "Observação": "observacao"
  }
};

// ==================== INSTALAÇÕES TEMPLATE ====================
export const INSTALACOES_TEMPLATE = {
  name: "Instalações",
  headers: [
    "Nome*", "Sigla*", "Polo ID*", "Tipo*", "Código ANP",
    "Localização", "Status*", "Observações"
  ],

  exampleData: [
    ["Plataforma P-52", "P-52", "1", "plataforma", "ANP-INST-001", "Bacia de Campos", "ativo", "Plataforma offshore de produção"]
  ],

  validations: {
    required: ["Nome*", "Sigla*", "Polo ID*", "Tipo*", "Status*"],
    tipoOptions: ["plataforma", "fpso", "manifold", "estacao_terrestre", "ups", "refinaria"],
    statusOptions: ["ativo", "inativo", "manutencao", "descomissionado"]
  },

  fieldMapping: {
    "Nome*": "nome",
    "Sigla*": "sigla",
    "Polo ID*": "poloId",
    "Tipo*": "tipo",
    "Código ANP": "codigoAnp",
    "Localização": "localizacao",
    "Status*": "status",
    "Observações": "observacoes"
  }
};

// ==================== PONTOS DE MEDIÇÃO TEMPLATE ====================
export const PONTOS_MEDICAO_TEMPLATE = {
  name: "Pontos de Medição",
  headers: [
    "Equipamento ID*", "TAG*", "Tipo Medição*", "Fluido Medido*",
    "Função Medição*", "Polo ID", "Instalação ID", "Campo ID",
    "Unidade Medição", "Faixa Medição", "Pressão Operação (bar)",
    "Temperatura Operação (°C)", "Status*", "Observações"
  ],

  exampleData: [
    ["1", "PM-FT-001", "vazao", "gas_natural", "fiscal", "1", "1", "1", "m³/h", "0-1000", "150", "60", "ativo", "Ponto de medição fiscal principal"]
  ],

  validations: {
    required: ["Equipamento ID*", "TAG*", "Tipo Medição*", "Fluido Medido*", "Função Medição*", "Status*"],
    tipoMedicaoOptions: ["vazao", "pressao", "temperatura", "densidade", "nivel", "composicao"],
    fluidoMedidoOptions: ["gas_natural", "oleo", "agua", "condensado", "gnl", "glp"],
    funcaoMedicaoOptions: ["fiscal", "apropriacao", "operacional", "transferencia_custodia"],
    statusOptions: ["ativo", "inativo", "manutencao", "calibracao"]
  },

  fieldMapping: {
    "Equipamento ID*": "equipamentoId",
    "TAG*": "tag",
    "Tipo Medição*": "tipoMedicao",
    "Fluido Medido*": "fluidoMedido",
    "Função Medição*": "funcaoMedicao",
    "Polo ID": "poloId",
    "Instalação ID": "instalacaoId",
    "Campo ID": "campoId",
    "Unidade Medição": "unidadeMedicao",
    "Faixa Medição": "faixaMedicao",
    "Pressão Operação (bar)": "pressaoOperacao",
    "Temperatura Operação (°C)": "temperaturaOperacao",
    "Status*": "status",
    "Observações": "observacoes"
  }
};

// ==================== PLANO DE CALIBRAÇÕES TEMPLATE ====================
export const PLANO_CALIBRACOES_TEMPLATE = {
  name: "Plano de Calibrações",
  headers: [
    "Equipamento ID*", "Data Última Calibração", "Data Próxima Calibração*",
    "Dias Para Vencer", "Status Calibração*", "Certificado Calibração",
    "Laboratório", "Responsável Técnico", "Observações"
  ],

  exampleData: [
    ["1", "2024-01-15", "2025-01-15", "365", "conforme", "CERT-2024-001", "Labcal Metrologia", "João Silva", "Calibração anual conforme ANP"]
  ],

  validations: {
    required: ["Equipamento ID*", "Data Próxima Calibração*", "Status Calibração*"],
    statusCalibracaoOptions: ["pendente", "agendado", "em_execucao", "conforme", "nao_conforme", "vencido"]
  },

  fieldMapping: {
    "Equipamento ID*": "equipamentoId",
    "Data Última Calibração": "dataUltimaCalibracao",
    "Data Próxima Calibração*": "dataProximaCalibracao",
    "Dias Para Vencer": "diasParaVencer",
    "Status Calibração*": "statusCalibracao",
    "Certificado Calibração": "certificadoCalibracao",
    "Laboratório": "laboratorio",
    "Responsável Técnico": "responsavelTecnico",
    "Observações": "observacoes"
  }
};

/**
 * Get all available templates
 */
export const TEMPLATES = {
  equipamentos: EQUIPAMENTOS_TEMPLATE,
  pocos: POCOS_TEMPLATE,
  placas_orificio: PLACAS_ORIFICIO_TEMPLATE,
  valvulas: VALVULAS_TEMPLATE,
  campos: CAMPOS_TEMPLATE,
  trechos_retos: TRECHOS_RETOS_TEMPLATE,
  analises_quimicas: ANALISES_QUIMICAS_TEMPLATE,
  controle_incertezas: CONTROLE_INCERTEZAS_TEMPLATE,
  instalacoes: INSTALACOES_TEMPLATE,
  pontos_medicao: PONTOS_MEDICAO_TEMPLATE,
  plano_calibracoes: PLANO_CALIBRACOES_TEMPLATE
};
