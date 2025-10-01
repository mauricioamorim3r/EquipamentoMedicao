// Dados reais da instalação 3R-2 extraídos da planilha
export const installacao3R2Data = {
  instalacao: "3R-2",
  equipamentos: [
    // Fiscal Gás - Flare
    {
      tag: "309-FT-9144",
      nome: "Medidor Ultrassônico - Flare",
      tipo: "Medidor de Vazão",
      categoria: "Ultrassônico",
      numeroSerie: "2011-0108/055U-11/055D-11",
      localizacao: "309-FT-9144 - Flare",
      aplicabilidade: "Fiscal Gás",
      fluido: "Gás Natural",
      pontoMedicao: "309-FT-9144",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Ultrassônico",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },
    {
      tag: "309-PIT-9144",
      nome: "Transmissor de Pressão - Flare",
      tipo: "Transmissor de Pressão",
      categoria: "Manométrico",
      numeroSerie: "0532768",
      localizacao: "309-FT-9144 - Flare",
      aplicabilidade: "Fiscal Gás",
      fluido: "Gás Natural",
      pontoMedicao: "309-FT-9144",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Manométrico",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },
    {
      tag: "309-TIT-9144",
      nome: "Transmissor de Temperatura - Flare",
      tipo: "Transmissor de Temperatura",
      categoria: "RTD",
      numeroSerie: "0703654",
      localizacao: "309-FT-9144 - Flare",
      aplicabilidade: "Fiscal Gás",
      fluido: "Gás Natural",
      pontoMedicao: "309-FT-9144",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "4W -100Ω-RTD",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },

    // Apropriação Óleo - Ponto 9128
    {
      tag: "302-FT-9128",
      nome: "Medidor Mássico 8\" - Operacional",
      tipo: "Medidor de Vazão",
      categoria: "Mássico",
      numeroSerie: "12064499 / 3803284",
      localizacao: "Ponto 9128",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9128",
      dataInstalacao: "2025-07-08",
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Mássico 8\"",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },
    {
      tag: "302-PIT-9132",
      nome: "Transmissor de Pressão - Ponto 9128",
      tipo: "Transmissor de Pressão", 
      categoria: "Manométrico",
      numeroSerie: "0532771",
      localizacao: "Ponto 9128",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9128",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Manométrico",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },

    // Apropriação Óleo - Ponto 9129
    {
      tag: "302-FT-9129",
      nome: "Medidor Mássico 3\" - Operacional",
      tipo: "Medidor de Vazão",
      categoria: "Mássico", 
      numeroSerie: "14235190 / 3812304",
      localizacao: "Ponto 9129",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9129",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Mássico 3\"",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },

    // Master Meters
    {
      tag: "302-FT-9138",
      nome: "Medidor Mássico 8\" - Master",
      tipo: "Medidor de Vazão",
      categoria: "Mássico",
      numeroSerie: "12064452 / 3812977",
      localizacao: "Ponto 9138",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo", 
      pontoMedicao: "9138",
      dataInstalacao: null,
      status: "Em Reparo",
      fabricante: "A definir",
      modelo: "Mássico 8\"",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },
    {
      tag: "302-FT-9139",
      nome: "Medidor Mássico 4\" - Master", 
      tipo: "Medidor de Vazão",
      categoria: "Mássico",
      numeroSerie: "14234779 / 3787628",
      localizacao: "Ponto 9139",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9139", 
      dataInstalacao: null,
      status: "Em Reparo",
      fabricante: "A definir",
      modelo: "Mássico 4\"",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },

    // Apropriação Gás
    {
      tag: "302-FT-9143",
      nome: "Medidor de Pressão Diferencial",
      tipo: "Medidor de Vazão",
      categoria: "Pressão Diferencial",
      numeroSerie: "1150789",
      localizacao: "302-FT-9143",
      aplicabilidade: "Apropriação Gás",
      fluido: "Gás Natural",
      pontoMedicao: "302-FT-9143",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir", 
      modelo: "DP",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },

    // Válvulas de Duplo Bloqueio
    {
      tag: "302-HV-9126",
      nome: "Válvula Duplo Bloqueio",
      tipo: "Válvula",
      categoria: "Duplo Bloqueio",
      numeroSerie: "B458220103",
      localizacao: "Sistema de Medição",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9128",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Válvula Duplo Bloqueio",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },
    {
      tag: "302-HV-9127", 
      nome: "Válvula Duplo Bloqueio",
      tipo: "Válvula",
      categoria: "Duplo Bloqueio",
      numeroSerie: "B458220202",
      localizacao: "Sistema de Medição",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo", 
      pontoMedicao: "9128",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Válvula Duplo Bloqueio",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },

    // Computadores de Vazão
    {
      tag: "302-FQIC-9143",
      nome: "Computador de Vazão",
      tipo: "Computador de Vazão",
      categoria: "Computacional",
      numeroSerie: "18361192",
      localizacao: "Sistema de Medição",
      aplicabilidade: "Fiscal/Apropriação",
      fluido: "Óleo/Gás",
      pontoMedicao: "Múltiplos",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Computador de Vazão",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    },

    // Analisador BSW
    {
      tag: "302-AT-9144",
      nome: "Analisador de BSW",
      tipo: "Analisador",
      categoria: "BSW",
      numeroSerie: "005681",
      localizacao: "Sistema de Análise",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9138",
      dataInstalacao: null,
      status: "Ativo",
      fabricante: "A definir",
      modelo: "Analisador de BSW",
      periodicidadeCalibracaoANP: 365,
      frequenciaCalibracaoMeses: 12,
      diasParaAlertar: 30
    }
  ],

  // Dados de calibração reais da planilha
  execucoesCalibracaoExemplo: [
    {
      equipamentoTag: "309-FT-9144",
      aplicabilidade: "Fiscal Gás",
      fluido: "Gás Natural", 
      pontoMedicao: "309-FT-9144 - Flare",
      localCalibracao: "Campo",
      diasParaAlertar: 30,
      frequenciaCalibracaoMeses: 12,
      
      // Último Certificado
      numeroUltimoCertificado: "20250628",
      dataUltimoCertificado: "2025-06-28",
      statusUltimoCertificado: "valido",
      laboratorioUltimo: "INMETRO",
      dataEmissaoUltimo: "2025-06-25",
      
      periodicidadeCalibracao: 365,
      dataProximaCalibracao: "2025-12-25",
      observacoesUltimo: "Calibração realizada conforme procedimento ANP"
    },
    {
      equipamentoTag: "302-FT-9128",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9128", 
      localCalibracao: "Laboratório",
      diasParaAlertar: 30,
      frequenciaCalibracaoMeses: 12,
      
      // Último Certificado
      numeroUltimoCertificado: "25068440M",
      dataUltimoCertificado: "2025-07-01",
      statusUltimoCertificado: "valido",
      laboratorioUltimo: "IPT",
      dataEmissaoUltimo: "2025-06-26",
      meterFactorUltimo: 1.00045,
      kFactorUltimo: 1000.25,
      incertezaCalibracaoUltimo: 0.15,
      erroMaximoAdmissivelUltimo: 0.50,
      
      periodicidadeCalibracao: 365,
      dataProximaCalibracao: "2026-06-26",
      observacoesUltimo: "04-07-25: Recebido o certificado da calibração do medidor. A data da calibração foi reajustada para 01/07/25. Maio-25: A Calibração do medidor venceu em 05/04/24, no entanto, não houve teste de poço até que o medidor fosse calibrado em 17/05/24"
    },
    {
      equipamentoTag: "302-PIT-9132",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9128",
      localCalibracao: "Campo",
      diasParaAlertar: 30,
      frequenciaCalibracaoMeses: 12,
      
      // Último Certificado
      numeroUltimoCertificado: "LMH 1208/2023",
      dataUltimoCertificado: "2025-08-01",
      statusUltimoCertificado: "valido",
      laboratorioUltimo: "TUV",
      dataEmissaoUltimo: "2025-07-28",
      
      periodicidadeCalibracao: 365,
      dataProximaCalibracao: "2026-01-28",
      observacoesUltimo: "Próximo embarque será dia 11-08-25"
    },
    {
      equipamentoTag: "302-FT-9138",
      aplicabilidade: "Apropriação Óleo", 
      fluido: "Óleo",
      pontoMedicao: "9138",
      localCalibracao: "Laboratório",
      diasParaAlertar: 60,
      frequenciaCalibracaoMeses: 12,
      
      // Último Certificado
      statusUltimoCertificado: "vencido",
      dataUltimoCertificado: "2019-08-08",
      
      periodicidadeCalibracao: 365,
      observacoesUltimo: "Na HIRSA para reparo"
    },
    {
      equipamentoTag: "302-HV-9142",
      aplicabilidade: "Apropriação Óleo",
      fluido: "Óleo",
      pontoMedicao: "9128",
      localCalibracao: "Campo",
      diasParaAlertar: 30,
      frequenciaCalibracaoMeses: 12,
      
      // Último Certificado
      numeroUltimoCertificado: "HV-P61-002/22",
      dataUltimoCertificado: "2023-11-25",
      statusUltimoCertificado: "proximo_vencimento",
      laboratorioUltimo: "SGS",
      dataEmissaoUltimo: "2023-11-20",
      
      periodicidadeCalibracao: 365,
      dataProximaCalibracao: "2024-11-24",
      observacoesUltimo: "Cobrar A&O o embarque das válvulas Reparadas e realizar teste de estanqueidade"
    }
  ],

  // Padrões identificados
  padroes: {
    aplicabilidades: ["Fiscal Gás", "Apropriação Óleo", "Apropriação Gás"],
    tiposEquipamentos: [
      "Ultrassônico", "Manométrico", "4W -100Ω-RTD", "PT 100-4W", "Pt100-3W", 
      "Trecho Reto à Montante", "Trecho Reto à Jusante", "Computador de Vazão", 
      "Mássico 8\"", "Mássico 3\"", "Mássico 4\"", "Válvula Duplo Bloqueio", 
      "Analisador de BSW", "DP", "Placa Orifício"
    ],
    prefixosTags: ["FT", "PIT", "TIT", "TE", "FX", "FQIC", "HV", "SAMP", "AT", "FE"],
    laboratorios: ["LMH", "CNU", "INMETRO", "IPT", "TUV", "SGS"],
    fluidos: ["Gás Natural", "Óleo"],
    observacoesComuns: [
      "Próximo embarque será dia 11-08-25",
      "Check List",
      "Na HIRSA para reparo",
      "Manutenção Preventiva",
      "Cobrar A&O o embarque das válvulas Reparadas e realizar teste de estanqueidade"
    ]
  }
};