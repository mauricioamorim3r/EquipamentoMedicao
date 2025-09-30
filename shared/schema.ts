import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, date, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizational Hierarchy
export const polos = pgTable("polos", {
  id: integer("polo_id").primaryKey().generatedByDefaultAsIdentity(),
  nome: text("nome_polo").notNull(),
  sigla: text("sigla_polo").notNull().unique(),
  diretoria: text("diretoria"),
  empresa: text("empresa"),
  cnpj: text("cnpj"),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campos = pgTable("campos", {
  id: integer("campo_id").primaryKey().generatedByDefaultAsIdentity(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  nome: text("nome_campo").notNull(),
  sigla: text("sigla_campo").notNull().unique(),
  diretoria: text("diretoria"),
  empresa: text("empresa"),
  cnpj: text("cnpj"),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const instalacoes = pgTable("instalacoes", {
  id: integer("instalacao_id").primaryKey().generatedByDefaultAsIdentity(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  campoId: integer("campo_id").references(() => campos.id),
  nome: text("nome_instalacao").notNull(),
  sigla: text("sigla_instalacao").notNull().unique(),
  tipo: text("tipo_instalacao"),
  situacao: text("situacao"),
  ambiente: text("ambiente"),
  laminaAgua: real("lamina_agua"),
  estado: text("estado"),
  cidade: text("cidade"),
  operadora: text("operadora"),
  capacidadePetroleo: real("capacidade_petroleo"),
  capacidadeGas: real("capacidade_gas"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const equipamentos = pgTable("equipamentos", {
  id: integer("equipamento_id").primaryKey().generatedByDefaultAsIdentity(),
  numeroSerie: text("numero_serie").notNull().unique(),
  tag: text("tag_equipamento").notNull().unique(),
  nome: text("nome_equipamento").notNull(),
  tipo: text("tipo_equipamento").notNull(),
  modelo: text("modelo"),
  fabricante: text("fabricante"),
  unidadeMedida: text("unidade_medida"),
  resolucao: text("resolucao"),
  faixaMinEquipamento: real("faixa_min_equipamento"),
  faixaMaxEquipamento: real("faixa_max_equipamento"),
  faixaMinPam: real("faixa_min_pam"),
  faixaMaxPam: real("faixa_max_pam"),
  faixaMinCalibrada: real("faixa_min_calibrada"),
  faixaMaxCalibrada: real("faixa_max_calibrada"),
  condicoesAmbientaisOperacao: text("condicoes_ambientais_operacao"),
  softwareVersao: text("software_versao"),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  classificacao: text("classificacao"),
  frequenciaCalibracao: integer("frequencia_calibracao_anp"),
  ativoMxm: text("ativo_mxm"),
  planoManutencao: text("plano_manutencao_mxm"),
  criterioAceitacao: text("criterio_aceitacao"),
  erroMaximoAdmissivel: real("erro_maximo_admissivel"),
  statusOperacional: text("status_operacional").notNull().default("Em Operação"),
  status: text("status_equipamento").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pontosMedicao = pgTable("pontos_medicao", {
  id: integer("ponto_medicao_id").primaryKey().generatedByDefaultAsIdentity(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  tag: text("tag_ponto_medicao").notNull().unique(),
  nome: text("nome_ponto_medicao").notNull(),
  classificacao: text("classificacao"),
  localizacao: text("localizacao"),
  tipoMedidorPrimario: text("tipo_medidor_primario"),

  // Equipamento Primário Principal
  numeroSeriePrimario: text("numero_serie_primario"),
  tagEquipamentoPrimario: text("tag_equipamento_primario"),
  calibracaoPrimarioValida: date("calibracao_primario_valida"),
  statusMetrologicoPrimario: text("status_metrologico_primario"),

  // Trecho Reto
  numeroSerieTrechoReto: text("numero_serie_trecho_reto"),
  tagTrechoReto: text("tag_trecho_reto"),
  calibracaoTrechoValida: date("calibracao_trecho_valida"),
  statusMetrologicoTrecho: text("status_metrologico_trecho"),

  // Secundário - Pressão
  numeroSeriePressao: text("numero_serie_pressao"),
  tagPressao: text("tag_pressao"),
  calibracaoPressaoValida: date("calibracao_pressao_valida"),
  statusMetrologicoPressao: text("status_metrologico_pressao"),

  // Secundário - Pressão Diferencial
  numeroSeriePressaoDif: text("numero_serie_pressao_dif"),
  tagPressaoDif: text("tag_pressao_dif"),
  calibracaoPressaoDifValida: date("calibracao_pressao_dif_valida"),
  statusMetrologicoPressaoDif: text("status_metrologico_pressao_dif"),

  // Secundário - Temperatura
  numeroSerieTemperatura: text("numero_serie_temperatura"),
  tagTemperatura: text("tag_temperatura"),
  calibracaoTemperaturaValida: date("calibracao_temperatura_valida"),
  statusMetrologicoTemperatura: text("status_metrologico_temperatura"),

  // Secundário - Sensor Temperatura
  numeroSerieSensorTemp: text("numero_serie_sensor_temp"),
  tagSensorTemp: text("tag_sensor_temp"),
  calibracaoSensorValida: date("calibracao_sensor_valida"),
  statusMetrologicoSensor: text("status_metrologico_sensor"),

  status: text("status_ponto").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calibration Control
export const planoCalibracoes = pgTable("plano_calibracao", {
  id: integer("calibracao_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  dataUltimaCalibracão: date("data_ultima_calibracao"),
  dataProximaCalibracão: date("data_proxima_calibracao"),
  diasParaVencer: integer("dias_para_vencer"),
  statusCalibracao: text("status_calibracao").notNull().default("pendente"),
  certificadoCalibracão: text("certificado_calibracao"),
  laboratorio: text("laboratorio"),
  responsavelTecnico: text("responsavel_tecnico"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Nova tabela para certificados de calibração com histórico completo
export const certificadosCalibração = pgTable("certificados_calibracao", {
  id: integer("certificado_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  numeroSerieEquipamento: text("numero_serie_equipamento").notNull(),
  tagEquipamento: text("tag_equipamento").notNull(),
  nomeEquipamento: text("nome_equipamento").notNull(),
  
  // Informações do certificado
  numeroCertificado: text("numero_certificado").notNull(),
  revisaoCertificado: text("revisao_certificado"),
  dataCertificado: date("data_certificado").notNull(),
  statusCertificado: text("status_certificado").notNull().default("valido"),
  certificadoPath: text("certificado_path"),
  
  // Periodicidade e regulamentação
  periodicidadeCalibracao: integer("periodicidade_calibracao_anp"),
  
  // Laboratório e responsáveis
  laboratorio: text("laboratorio"),
  responsavelTecnico: text("responsavel_tecnico"),
  
  // Resultados da calibração
  resultadoCalibracao: text("resultado_calibracao"),
  incertezaExpandida: real("incerteza_expandida"),
  analiseCriticaResultados: text("analise_critica_resultados"),
  
  // Observações
  observacoes: text("observacoes"),
  
  // Ordem do certificado (último = 1, penúltimo = 2, antepenúltimo = 3)
  ordemCertificado: integer("ordem_certificado").notNull().default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para execução de calibrações - versão nova
export const execucaoCalibracoes = pgTable("execucao_calibracoes", {
  id: integer("execucao_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  
  // Informações básicas do equipamento
  numeroSerieEquipamento: text("numero_serie_equipamento").notNull(),
  tagEquipamento: text("tag_equipamento").notNull(),
  nomeEquipamento: text("nome_equipamento").notNull(),
  
  // Último certificado
  numeroUltimoCertificado: text("numero_ultimo_certificado"),
  revisaoUltimoCertificado: text("revisao_ultimo_certificado"),
  dataUltimoCertificado: date("data_ultimo_certificado"),
  statusUltimoCertificado: text("status_ultimo_certificado"),
  certificadoUltimoPath: text("certificado_ultimo_path"),
  
  // Penúltimo certificado
  numeroPenultimoCertificado: text("numero_penultimo_certificado"),
  revisaoPenultimoCertificado: text("revisao_penultimo_certificado"),
  dataPenultimoCertificado: date("data_penultimo_certificado"),
  statusPenultimoCertificado: text("status_penultimo_certificado"),
  certificadoPenultimoPath: text("certificado_penultimo_path"),
  
  // Antepenúltimo certificado
  numeroAntepenultimoCertificado: text("numero_antepenultimo_certificado"),
  revisaoAntepenultimoCertificado: text("revisao_antepenultimo_certificado"),
  dataAntepenultimoCertificado: date("data_antepenultimo_certificado"),
  statusAntepenultimoCertificado: text("status_antepenultimo_certificado"),
  certificadoAntepenultimoPath: text("certificado_antepenultimo_path"),
  
  // Periodicidade e observações
  periodicidadeCalibracao: integer("periodicidade_calibracao_anp"),
  observacoes: text("observacoes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const historicoCalibracoes = pgTable("historico_calibracoes", {
  id: integer("historico_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  poloId: integer("polo_id").references(() => polos.id),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id),
  tagPontoMedicao: text("tag_ponto_medicao"),
  nomePontoMedicao: text("nome_ponto_medicao"),
  classificacao: text("classificacao"),

  // Último Certificado
  dataCalibracão: date("data_calibracao").notNull(),
  certificadoNumero: text("certificado_numero"),
  certificadoRevisao: text("certificado_revisao"),
  certificadoStatus: text("certificado_status"),
  certificadoPath: text("certificado_path"),

  // Penúltimo Certificado
  certificadoNumeroPenultimo: text("certificado_numero_penultimo"),
  certificadoRevisaoPenultimo: text("certificado_revisao_penultimo"),
  dataPenultimoCertificado: date("data_penultimo_certificado"),
  statusPenultimoCertificado: text("status_penultimo_certificado"),

  // Antepenúltimo Certificado
  certificadoNumeroAntepenultimo: text("certificado_numero_antepenultimo"),
  certificadoRevisaoAntepenultimo: text("certificado_revisao_antepenultimo"),
  dataAntepenultimoCertificado: date("data_antepenultimo_certificado"),
  statusAntepenultimoCertificado: text("status_antepenultimo_certificado"),

  periodicidadeCalibracao: integer("periodicidade_calibracao_anp"),
  laboratorio: text("laboratorio"),
  resultado: text("resultado"),
  incertezaExpandida: real("incerteza_expandida"),
  responsavel: text("responsavel"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendário de Calibração
export const calendarioCalibracoes = pgTable("calendario_calibracoes", {
  id: integer("calendario_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  tagPontoMedicao: text("tag_ponto_medicao"),
  nomePontoMedicao: text("nome_ponto_medicao"),
  classificacao: text("classificacao"),
  tagEquipamento: text("tag_equipamento"),
  nomeEquipamento: text("nome_equipamento"),
  numeroSerie: text("numero_serie"),
  tipoCalibracao: text("tipo_calibracao"),
  motivo: text("motivo"),
  laboratorio: text("laboratorio"),
  previsaoCalibracao: date("previsao_calibracao"),
  vencimentoCalibracao: date("vencimento_calibracao"),
  solicitacaoFeitaEm: date("solicitacao_feita_em"),
  envioEquipamentoEm: date("envio_equipamento_em"),
  chegouLaboratorioEm: date("chegou_laboratorio_em"),
  calibracaoFinalizadaEm: date("calibracao_finalizada_em"),
  equipamentoRecebidoEmpresaEm: date("equipamento_recebido_empresa_em"),
  dataRetornoUnidade: date("data_retorno_unidade"),
  dataInstalacao: date("data_instalacao"),
  observacao: text("observacao"),
  certificadoPath: text("certificado_path"),
  status: text("status").notNull().default("pendente"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wells Control
export const cadastroPocos = pgTable("cadastro_poco", {
  id: integer("poco_id").primaryKey().generatedByDefaultAsIdentity(),
  codigo: text("codigo_poco").notNull().unique(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  nome: text("nome_poco").notNull(),
  tipo: text("tipo_poco"),
  codigoAnp: text("codigo_anp").notNull().unique(),
  frequenciaTesteDias: integer("frequencia_teste_dias").default(90),
  status: text("status_poco").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testesPocos = pgTable("teste_poco", {
  id: integer("teste_id").primaryKey().generatedByDefaultAsIdentity(),
  pocoId: integer("poco_id").references(() => cadastroPocos.id).notNull(),
  poloId: integer("polo_id").references(() => polos.id),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id),
  dataTeste: date("data_teste").notNull(),
  tipoTeste: text("tipo_teste").notNull(),
  dataPrevistoProximoTeste: date("data_previsto_proximo_teste"),
  numeroBoletimTeste: text("numero_boletim_teste"),
  tagMedidorOleo: text("tag_medidor_oleo"),
  vazaoOleo: real("vazao_oleo"),
  vazaoGas: real("vazao_gas"),
  vazaoAgua: real("vazao_agua"),
  bsw: real("bsw"),
  rgo: real("rgo"),
  resultadoTeste: text("resultado_teste"),
  dataAtualizacaoPotencial: date("data_atualizacao_potencial"),
  arquivoBtpPath: text("arquivo_btp_path"),
  ehUltimoTeste: boolean("eh_ultimo_teste").default(false),
  periodicidadeTeste: integer("periodicidade_teste"),
  responsavelTeste: text("responsavel_teste"),
  statusTeste: text("status_teste").notNull().default("pendente"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orifice Plates
export const placasOrificio = pgTable("placas_orificio", {
  id: integer("placa_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  numeroSerie: text("numero_serie").notNull(),
  campoId: integer("campo_id").references(() => campos.id),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id),
  pontoInstalacaoId: integer("ponto_instalacao_id").references(() => pontosMedicao.id),
  material: text("material"),
  diametroExterno: real("diametro_externo_de"),
  diametroOrificio20c: real("diametro_orificio_20c"),
  espessura: real("espessura"),
  vazaoMinima: real("vazao_minima"),
  vazaoMaxima: real("vazao_maxima"),
  diametroNominal: real("diametro_nominal_dn"),
  diametroInternoMedio: real("diametro_interno_medio_dm"),
  diametroInternoMedio20c: real("diametro_interno_medio_20c_dr"),
  certificadoVigente: text("certificado_vigente"),
  norma: text("norma"),
  dataInspecao: date("data_inspecao"),
  dataInstalacao: date("data_instalacao"),
  cartaNumero: text("carta_numero"),
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trechos Retos
export const trechosRetos = pgTable("trechos_retos", {
  id: integer("trecho_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  numeroSerie: text("numero_serie").notNull(),
  campoId: integer("campo_id").references(() => campos.id),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id),
  pontoInstalacaoId: integer("ponto_instalacao_id").references(() => pontosMedicao.id),
  classe: text("classe"),
  diametroNominal: real("diametro_nominal_dn"),
  diametroReferencia20c: real("diametro_referencia_20c_dr"),
  tipoAco: text("tipo_aco"),
  tagTrechoMontanteCondicionador: text("tag_trecho_montante_condicionador"),
  numeroSerieTrechoMontanteCondicionador: text("numero_serie_trecho_montante_condicionador"),
  tagTrechoMontantePlaca: text("tag_trecho_montante_placa"),
  numeroSerieTrechoMontantePlaca: text("numero_serie_trecho_montante_placa"),
  tagCondicionadorFluxo: text("tag_condicionador_fluxo"),
  numeroSerieCondicionadorFluxo: text("numero_serie_condicionador_fluxo"),
  numeroSeriePortaPlaca: text("numero_serie_porta_placa"),
  tagTrechoJusante: text("tag_trecho_jusante"),
  numeroSerieTrechoJusante: text("numero_serie_trecho_jusante"),
  certificadoVigente: text("certificado_vigente"),
  norma: text("norma"),
  dataInspecao: date("data_inspecao"),
  dataInstalacao: date("data_instalacao"),
  cartaNumero: text("carta_numero"),
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medidores Primários
export const medidoresPrimarios = pgTable("medidores_primarios", {
  id: integer("medidor_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  numeroSerie: text("numero_serie").notNull(),
  campoId: integer("campo_id").references(() => campos.id),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id),
  pontoInstalacaoId: integer("ponto_instalacao_id").references(() => pontosMedicao.id),
  
  // Campos comuns a todos os tipos
  tipoMedidor: text("tipo_medidor").notNull(), // CORIOLIS, ULTRASSÔNICO, TURBINA, DESLOCAMENTO_POSITIVO, VORTEX, VENTURI, V_CONE
  diametroNominal: decimal("diametro_nominal_mm", { precision: 18, scale: 6 }),
  classePressao: text("classe_pressao"),
  material: text("material"),
  pressaoBaseKpa: decimal("pressao_base_kpa", { precision: 18, scale: 6 }),
  temperaturaBaseC: decimal("temperatura_base_c", { precision: 18, scale: 6 }),
  fluido: text("fluido"),
  viscosidadeCpRef: decimal("viscosidade_cp_ref", { precision: 18, scale: 6 }),
  densidadeRefKgm3: decimal("densidade_ref_kgm3", { precision: 18, scale: 6 }),
  meterFactor: decimal("meter_factor", { precision: 18, scale: 6 }),
  kFactorPulsosL: decimal("k_factor_pulsos_l", { precision: 18, scale: 6 }),
  classeExatidao: text("classe_exatidao"),
  repetibilidadePct: decimal("repetibilidade_pct", { precision: 9, scale: 6 }),
  observacao: text("observacao"),
  
  // Campos específicos - Coriolis
  faixaVazaoMassaKgH: decimal("faixa_vazao_massa_kg_h", { precision: 18, scale: 6 }),
  faixaDensidadeKgm3: decimal("faixa_densidade_kgm3", { precision: 18, scale: 6 }),
  zeroStabilityKgH: decimal("zero_stability_kg_h", { precision: 18, scale: 6 }),
  
  // Campos específicos - Ultrassônico
  numeroCaminhos: integer("numero_caminhos"),
  anguloCaminhoGraus: decimal("angulo_caminho_graus", { precision: 6, scale: 2 }),
  comprimentoUpstreamD: decimal("comprimento_upstream_d", { precision: 18, scale: 6 }),
  comprimentoDownstreamD: decimal("comprimento_downstream_d", { precision: 18, scale: 6 }),
  
  // Campos específicos - Turbina
  kFactorPpm3: decimal("k_factor_ppm3", { precision: 18, scale: 8 }),
  viscosidadeMinCp: decimal("viscosidade_min_cp", { precision: 18, scale: 6 }),
  viscosidadeMaxCp: decimal("viscosidade_max_cp", { precision: 18, scale: 6 }),
  
  // Campos específicos - Deslocamento Positivo
  deslocamentoM3Rev: decimal("deslocamento_m3_rev", { precision: 18, scale: 9 }),
  kFactorPpm3DeslocPositivo: decimal("k_factor_ppm3_desloc_positivo", { precision: 18, scale: 8 }),
  deltaPMaxBar: decimal("deltap_max_bar", { precision: 18, scale: 6 }),
  
  // Campos específicos - Vortex
  constanteVortexK: decimal("constante_vortex_k", { precision: 18, scale: 8 }),
  larguraBluffMm: decimal("largura_bluff_mm", { precision: 18, scale: 6 }),
  reynoldsMin: decimal("reynolds_min", { precision: 18, scale: 2 }),
  
  // Campos específicos - Venturi / V-Cone
  tipoVenturi: text("tipo_venturi"),
  betaRatio: decimal("beta_ratio", { precision: 9, scale: 6 }),
  
  // Documentação
  certificadoVigente: text("certificado_vigente"),
  norma: text("norma"),
  dataInspecao: date("data_inspecao"),
  dataInstalacao: date("data_instalacao"),
  cartaNumero: text("carta_numero"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chemical Analysis - Gestão de Cilindros
export const gestaoCilindros = pgTable("gestao_cilindros", {
  id: integer("cilindro_id").primaryKey().generatedByDefaultAsIdentity(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  pocosTeste: text("pocos_teste"), // JSON array
  quantidadeCilindros: integer("quantidade_cilindros"),
  dataSolicitacaoCilindros: date("data_solicitacao_cilindros"),
  dataRecebimentoCilindrosBase: date("data_recebimento_cilindros_base"),
  dataRecebimentoCilindrosUnidade: date("data_recebimento_cilindros_unidade"),
  dataDesembarqueCilindro: date("data_desembarque_cilindro"),
  dataRecebimentoLaboratorio: date("data_recebimento_laboratorio"),
  observacao: text("observacao"),
  status: text("status").notNull().default("pendente"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Análises Físico-Químicas Genérica
export const analisesFisicoQuimicasGenerica = pgTable("analises_fq_generica", {
  id: integer("analise_id").primaryKey().generatedByDefaultAsIdentity(),
  tipoAnalise: text("tipo_analise").notNull(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  tagPontoInstalacao: text("tag_ponto_instalacao"),
  pocoId: integer("poco_id").references(() => cadastroPocos.id),
  motivo: text("motivo"),
  dataColeta: date("data_coleta"),
  dataAnalise: date("data_analise"),
  dataEmissaoResultado: date("data_emissao_resultado"),
  dataValidacaoResultado: date("data_validacao_resultado"),
  resultado: text("resultado"),
  prazo: integer("prazo"),
  observacao: text("observacao"),
  boletimPath: text("boletim_path"),
  status: text("status").notNull().default("pendente"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Análises Cromatografia - Ponto Medição
export const analisesCromatografia = pgTable("analises_cromatografia", {
  id: integer("analise_id").primaryKey().generatedByDefaultAsIdentity(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  tagPontoInstalacao: text("tag_ponto_instalacao"),
  pocoId: integer("poco_id").references(() => cadastroPocos.id),
  natureza: text("natureza"),
  dataColeta: date("data_coleta"),
  cilindro: text("cilindro"),
  dataEmbarque: date("data_embarque"),
  dataDesembarque: date("data_desembarque"),
  dataRecebimentoLaboratorio: date("data_recebimento_laboratorio"),
  dataEmissaoBoletim: date("data_emissao_boletim"),
  numeroBoletim: text("numero_boletim"),
  dataValidacaoBoletim: date("data_validacao_boletim"),
  resultado: text("resultado"),
  dataAtualizacaoComputadorVazao: date("data_atualizacao_computador_vazao"),
  observacao: text("observacao"),
  boletimPath: text("boletim_path"),
  status: text("status").notNull().default("pendente"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Análises PVT - Poço
export const analisesPvt = pgTable("analises_pvt", {
  id: integer("analise_id").primaryKey().generatedByDefaultAsIdentity(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  pocoId: integer("poco_id").references(() => cadastroPocos.id).notNull(),
  natureza: text("natureza"),
  dataColeta: date("data_coleta"),
  cilindro: text("cilindro"),
  dataEmbarque: date("data_embarque"),
  dataDesembarque: date("data_desembarque"),
  dataRecebimentoLaboratorio: date("data_recebimento_laboratorio"),
  dataEmissaoBoletim: date("data_emissao_boletim"),
  numeroBoletim: text("numero_boletim"),
  dataValidacaoBoletim: date("data_validacao_boletim"),
  resultado: text("resultado"),
  dataAtualizacaoComputadorVazao: date("data_atualizacao_computador_vazao"),
  observacao: text("observacao"),
  boletimPath: text("boletim_path"),
  status: text("status").notNull().default("pendente"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const planoColetas = pgTable("plano_coleta", {
  id: integer("coleta_id").primaryKey().generatedByDefaultAsIdentity(),
  pontoMedicaoId: integer("ponto_medicao_id").references(() => pontosMedicao.id).notNull(),
  dataEmbarque: date("data_embarque"),
  dataDesembarque: date("data_desembarque"),
  validadoOperacao: boolean("validado_operacao").default(false),
  validadoLaboratorio: boolean("validado_laboratorio").default(false),
  cilindrosDisponiveis: boolean("cilindros_disponiveis").default(false),
  embarqueAgendado: boolean("embarque_agendado").default(false),
  embarqueRealizado: boolean("embarque_realizado").default(false),
  coletaRealizada: boolean("coleta_realizada").default(false),
  resultadoEmitido: boolean("resultado_emitido").default(false),
  dataRealEmbarque: date("data_real_embarque"),
  observacoes: text("observacoes"),
  status: text("status").notNull().default("pendente"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analisesQuimicas = pgTable("analise_quimica", {
  id: integer("analise_id").primaryKey().generatedByDefaultAsIdentity(),
  planoColetaId: integer("plano_coleta_id").references(() => planoColetas.id).notNull(),
  pontoMedicaoId: integer("ponto_medicao_id").references(() => pontosMedicao.id).notNull(),
  dataColeta: date("data_coleta").notNull(),
  tipoFluido: text("tipo_fluido").notNull(),
  numeroCilindro: text("numero_cilindro"),
  volumeColetado: real("volume_coletado"),
  pressaoColeta: real("pressao_coleta"),
  temperaturaColeta: real("temperatura_coleta"),
  laboratorio: text("laboratorio").notNull(),
  numeroProtocolo: text("numero_protocolo"),
  dataAnalise: date("data_analise"),
  parametrosAnalisados: json("parametros_analisados"),
  resultadoAnalise: json("resultado_analise"),
  certificadoAnalise: text("certificado_analise"),
  validadoLaboratorio: boolean("validado_laboratorio").default(false),
  validadoOperacao: boolean("validado_operacao").default(false),
  aprovadoIso17025: boolean("aprovado_iso17025").default(false),
  statusAnalise: text("status_analise").notNull().default("pendente"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela: valvulas
export const valvulas = pgTable("valvulas", {
  id: integer("valvula_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id),

  // Identificação
  numeroSerie: text("numero_serie").notNull().unique(),
  tagValvula: text("tag_valvula").notNull().unique(),
  tipoValvula: text("tipo_valvula"),
  fabricante: text("fabricante"),
  modelo: text("modelo"),

  // Localização
  poloId: integer("polo_id").references(() => polos.id),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id),
  pontoInstalacaoId: integer("ponto_instalacao_id").references(() => pontosMedicao.id),
  localInstalacao: text("local_instalacao"),
  classificacao: text("classificacao"),
  finalidadeSistema: text("finalidade_sistema"),

  // Características técnicas
  classePressaoDiametro: text("classe_pressao_diametro"),
  diametroNominal: real("diametro_nominal"),

  // Teste de estanqueidade
  dataUltimoTeste: date("data_ultimo_teste"),
  resultadoUltimoTeste: text("resultado_ultimo_teste"),
  periodicidadeTeste: integer("periodicidade_teste"),
  dataPrevistaProximoTeste: date("data_prevista_proximo_teste"),
  relatorioEstanqueidadePath: text("relatorio_estanqueidade_path"),

  // Status
  statusOperacional: text("status_operacional").notNull().default("operacional"),
  observacao: text("observacao"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela: controle_incertezas
export const controleIncertezas = pgTable("controle_incertezas", {
  id: integer("incerteza_id").primaryKey().generatedByDefaultAsIdentity(),
  pontoMedicaoId: integer("ponto_medicao_id").references(() => pontosMedicao.id).notNull(),
  poloId: integer("polo_id").references(() => polos.id),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id),
  tagPontoInstalacao: text("tag_ponto_instalacao"),

  // Identificação
  dataExecucao: date("data_execucao").notNull(),
  numeroCertificado: text("numero_certificado"),

  // Valores de incerteza
  vazaoVolumetrica: real("vazao_volumetrica"),
  incertezaExpandida: real("incerteza_expandida"),
  incertezaExpandidaRelativa: real("incerteza_expandida_relativa"),
  criterioAceitacao: real("criterio_aceitacao"),
  classificacao: text("classificacao"),
  resultado: text("resultado"),
  observacao: text("observacao"),
  relatorioIncertezaPath: text("relatorio_incerteza_path"),

  // Status e validação
  status: text("status").notNull().default("pendente"),
  conformeLimite: boolean("conforme_limite").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela: incerteza_limite
export const incertezaLimites = pgTable("incerteza_limite", {
  id: integer("limite_id").primaryKey().generatedByDefaultAsIdentity(),
  fluido: text("fluido").notNull(),
  classificacao: text("classificacao").notNull(), // fiscal, apropriacao, operacional
  aplicacao: text("aplicacao"),
  
  // Limites
  limitePercentual: real("limite_percentual").notNull(),
  normaReferencia: text("norma_referencia"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela: sistema_notificacoes
export const sistemaNotificacoes = pgTable("sistema_notificacoes", {
  id: integer("notificacao_id").primaryKey().generatedByDefaultAsIdentity(),
  
  // Identificação
  titulo: text("titulo").notNull(),
  mensagem: text("mensagem").notNull(),
  tipo: text("tipo").notNull(), // info, warning, error, success
  categoria: text("categoria").notNull(), // calibracao, equipamento, poco, etc
  prioridade: text("prioridade").notNull().default("normal"), // baixa, normal, alta, critica
  
  // Referências
  entityType: text("entity_type"), // equipamento, poco, placa, etc
  entityId: integer("entity_id"),
  
  // Status
  status: text("status").notNull().default("ativa"), // ativa, lida, arquivada
  dataLeitura: timestamp("data_leitura"),
  dataExpiracao: timestamp("data_expiracao"),
  
  // Configuração
  autoGerada: boolean("auto_gerada").default(true),
  repeticao: boolean("repeticao").default(false),
  intervaloDias: integer("intervalo_dias"),
  
  // Metadados
  dadosAdicionais: text("dados_adicionais"), // JSON com dados específicos
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const polosRelations = relations(polos, ({ many }) => ({
  campos: many(campos),
  instalacoes: many(instalacoes),
  equipamentos: many(equipamentos),
  pocos: many(cadastroPocos),
  pontosMedicao: many(pontosMedicao),
  historicoCalibracoes: many(historicoCalibracoes),
  calendarioCalibracoes: many(calendarioCalibracoes),
  testesPocos: many(testesPocos),
  valvulas: many(valvulas),
  controleIncertezas: many(controleIncertezas),
  gestaoCilindros: many(gestaoCilindros),
  analisesFqGenerica: many(analisesFisicoQuimicasGenerica),
  analisesCromatografia: many(analisesCromatografia),
  analisesPvt: many(analisesPvt),
}));

export const camposRelations = relations(campos, ({ one, many }) => ({
  polo: one(polos, {
    fields: [campos.poloId],
    references: [polos.id],
  }),
  instalacoes: many(instalacoes),
  placasOrificio: many(placasOrificio),
  trechosRetos: many(trechosRetos),
}));

export const instalacoesRelations = relations(instalacoes, ({ one, many }) => ({
  polo: one(polos, {
    fields: [instalacoes.poloId],
    references: [polos.id],
  }),
  campo: one(campos, {
    fields: [instalacoes.campoId],
    references: [campos.id],
  }),
  equipamentos: many(equipamentos),
  pontosMedicao: many(pontosMedicao),
  pocos: many(cadastroPocos),
  historicoCalibracoes: many(historicoCalibracoes),
  calendarioCalibracoes: many(calendarioCalibracoes),
  testesPocos: many(testesPocos),
  placasOrificio: many(placasOrificio),
  trechosRetos: many(trechosRetos),
  valvulas: many(valvulas),
  controleIncertezas: many(controleIncertezas),
  gestaoCilindros: many(gestaoCilindros),
  analisesFqGenerica: many(analisesFisicoQuimicasGenerica),
  analisesCromatografia: many(analisesCromatografia),
  analisesPvt: many(analisesPvt),
}));

export const equipamentosRelations = relations(equipamentos, ({ one, many }) => ({
  polo: one(polos, {
    fields: [equipamentos.poloId],
    references: [polos.id],
  }),
  instalacao: one(instalacoes, {
    fields: [equipamentos.instalacaoId],
    references: [instalacoes.id],
  }),
  planoCalibracoes: many(planoCalibracoes),
  historicoCalibracoes: many(historicoCalibracoes),
  calendarioCalibracoes: many(calendarioCalibracoes),
  placasOrificio: many(placasOrificio),
  trechosRetos: many(trechosRetos),
  valvulas: many(valvulas),
}));

export const pontosMedicaoRelations = relations(pontosMedicao, ({ one, many }) => ({
  polo: one(polos, {
    fields: [pontosMedicao.poloId],
    references: [polos.id],
  }),
  instalacao: one(instalacoes, {
    fields: [pontosMedicao.instalacaoId],
    references: [instalacoes.id],
  }),
  planoColetas: many(planoColetas),
  analisesQuimicas: many(analisesQuimicas),
  placasOrificio: many(placasOrificio),
  trechosRetos: many(trechosRetos),
  valvulas: many(valvulas),
  controleIncertezas: many(controleIncertezas),
}));

export const planoColetasRelations = relations(planoColetas, ({ one, many }) => ({
  pontoMedicao: one(pontosMedicao, {
    fields: [planoColetas.pontoMedicaoId],
    references: [pontosMedicao.id],
  }),
  analisesQuimicas: many(analisesQuimicas),
}));

export const analisesQuimicasRelations = relations(analisesQuimicas, ({ one }) => ({
  planoColeta: one(planoColetas, {
    fields: [analisesQuimicas.planoColetaId],
    references: [planoColetas.id],
  }),
  pontoMedicao: one(pontosMedicao, {
    fields: [analisesQuimicas.pontoMedicaoId],
    references: [pontosMedicao.id],
  }),
}));

export const planoCalibracaoRelations = relations(planoCalibracoes, ({ one }) => ({
  equipamento: one(equipamentos, {
    fields: [planoCalibracoes.equipamentoId],
    references: [equipamentos.id],
  }),
}));

export const cadastroPocosRelations = relations(cadastroPocos, ({ one, many }) => ({
  polo: one(polos, {
    fields: [cadastroPocos.poloId],
    references: [polos.id],
  }),
  instalacao: one(instalacoes, {
    fields: [cadastroPocos.instalacaoId],
    references: [instalacoes.id],
  }),
  testes: many(testesPocos),
}));

export const valvulasRelations = relations(valvulas, ({ one }) => ({
  equipamento: one(equipamentos, {
    fields: [valvulas.equipamentoId],
    references: [equipamentos.id],
  }),
  polo: one(polos, {
    fields: [valvulas.poloId],
    references: [polos.id],
  }),
  instalacao: one(instalacoes, {
    fields: [valvulas.instalacaoId],
    references: [instalacoes.id],
  }),
  pontoInstalacao: one(pontosMedicao, {
    fields: [valvulas.pontoInstalacaoId],
    references: [pontosMedicao.id],
  }),
}));

export const controleIncertezasRelations = relations(controleIncertezas, ({ one }) => ({
  pontoMedicao: one(pontosMedicao, {
    fields: [controleIncertezas.pontoMedicaoId],
    references: [pontosMedicao.id],
  }),
  polo: one(polos, {
    fields: [controleIncertezas.poloId],
    references: [polos.id],
  }),
  instalacao: one(instalacoes, {
    fields: [controleIncertezas.instalacaoId],
    references: [instalacoes.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export const insertPoloSchema = createInsertSchema(polos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstalacaoSchema = createInsertSchema(instalacoes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEquipamentoSchema = createInsertSchema(equipamentos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPontoMedicaoSchema = createInsertSchema(pontosMedicao).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlanoCalibracaoSchema = createInsertSchema(planoCalibracoes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCadastroPocoSchema = createInsertSchema(cadastroPocos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestePocoSchema = createInsertSchema(testesPocos).omit({
  id: true,
  createdAt: true,
});

export const insertPlacaOrificioSchema = createInsertSchema(placasOrificio).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlanoColetaSchema = createInsertSchema(planoColetas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnaliseQuimicaSchema = createInsertSchema(analisesQuimicas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertValvulaSchema = createInsertSchema(valvulas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertControleIncertezaSchema = createInsertSchema(controleIncertezas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIncertezaLimiteSchema = createInsertSchema(incertezaLimites).omit({
  id: true,
  createdAt: true,
});

export const insertSistemaNotificacaoSchema = createInsertSchema(sistemaNotificacoes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampoSchema = createInsertSchema(campos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarioCalibracaoSchema = createInsertSchema(calendarioCalibracoes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHistoricoCalibracaoSchema = createInsertSchema(historicoCalibracoes).omit({
  id: true,
  createdAt: true,
});

export const insertCertificadoCalibracaoSchema = createInsertSchema(certificadosCalibração).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExecucaoCalibracaoSchema = createInsertSchema(execucaoCalibracoes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrechoRetoSchema = createInsertSchema(trechosRetos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGestaoCilindroSchema = createInsertSchema(gestaoCilindros).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedidorPrimarioSchema = createInsertSchema(medidoresPrimarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnaliseFqGenericaSchema = createInsertSchema(analisesFisicoQuimicasGenerica).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnaliseCromatografiaSchema = createInsertSchema(analisesCromatografia).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalisePvtSchema = createInsertSchema(analisesPvt).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Polo = typeof polos.$inferSelect;
export type InsertPolo = z.infer<typeof insertPoloSchema>;
export type Instalacao = typeof instalacoes.$inferSelect;
export type InsertInstalacao = z.infer<typeof insertInstalacaoSchema>;
export type Equipamento = typeof equipamentos.$inferSelect;
export type InsertEquipamento = z.infer<typeof insertEquipamentoSchema>;
export type PontoMedicao = typeof pontosMedicao.$inferSelect;
export type InsertPontoMedicao = z.infer<typeof insertPontoMedicaoSchema>;
export type PlanoCalibracão = typeof planoCalibracoes.$inferSelect;
export type InsertPlanoCalibracão = z.infer<typeof insertPlanoCalibracaoSchema>;
export type CadastroPoço = typeof cadastroPocos.$inferSelect;
export type InsertCadastroPoço = z.infer<typeof insertCadastroPocoSchema>;
export type PlacaOrificio = typeof placasOrificio.$inferSelect;
export type InsertPlacaOrificio = z.infer<typeof insertPlacaOrificioSchema>;
export type TestePoco = typeof testesPocos.$inferSelect;
export type InsertTestePoco = z.infer<typeof insertTestePocoSchema>;
export type PlanoColeta = typeof planoColetas.$inferSelect;
export type InsertPlanoColeta = z.infer<typeof insertPlanoColetaSchema>;
export type AnaliseQuimica = typeof analisesQuimicas.$inferSelect;
export type InsertAnaliseQuimica = z.infer<typeof insertAnaliseQuimicaSchema>;
export type Valvula = typeof valvulas.$inferSelect;
export type InsertValvula = z.infer<typeof insertValvulaSchema>;
export type ControleIncerteza = typeof controleIncertezas.$inferSelect;
export type InsertControleIncerteza = z.infer<typeof insertControleIncertezaSchema>;
export type IncertezaLimite = typeof incertezaLimites.$inferSelect;
export type InsertIncertezaLimite = z.infer<typeof insertIncertezaLimiteSchema>;
export type SistemaNotificacao = typeof sistemaNotificacoes.$inferSelect;
export type InsertSistemaNotificacao = z.infer<typeof insertSistemaNotificacaoSchema>;
export type Campo = typeof campos.$inferSelect;
export type InsertCampo = z.infer<typeof insertCampoSchema>;
export type CalendarioCalibracao = typeof calendarioCalibracoes.$inferSelect;
export type InsertCalendarioCalibracao = z.infer<typeof insertCalendarioCalibracaoSchema>;
export type HistoricoCalibracao = typeof historicoCalibracoes.$inferSelect;
export type InsertHistoricoCalibracao = z.infer<typeof insertHistoricoCalibracaoSchema>;
export type CertificadoCalibracao = typeof certificadosCalibração.$inferSelect;
export type InsertCertificadoCalibracao = z.infer<typeof insertCertificadoCalibracaoSchema>;
export type ExecucaoCalibracao = typeof execucaoCalibracoes.$inferSelect;
export type InsertExecucaoCalibracao = z.infer<typeof insertExecucaoCalibracaoSchema>;
export type TrechoReto = typeof trechosRetos.$inferSelect;
export type InsertTrechoReto = z.infer<typeof insertTrechoRetoSchema>;
export type GestaoCilindro = typeof gestaoCilindros.$inferSelect;
export type InsertGestaoCilindro = z.infer<typeof insertGestaoCilindroSchema>;
export type AnaliseFqGenerica = typeof analisesFisicoQuimicasGenerica.$inferSelect;
export type InsertAnaliseFqGenerica = z.infer<typeof insertAnaliseFqGenericaSchema>;
export type AnaliseCromatografia = typeof analisesCromatografia.$inferSelect;
export type InsertAnaliseCromatografia = z.infer<typeof insertAnaliseCromatografiaSchema>;
export type AnalisePvt = typeof analisesPvt.$inferSelect;
export type InsertAnalisePvt = z.infer<typeof insertAnalisePvtSchema>;
