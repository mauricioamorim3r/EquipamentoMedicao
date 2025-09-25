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

export const instalacoes = pgTable("instalacoes", {
  id: integer("instalacao_id").primaryKey().generatedByDefaultAsIdentity(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  nome: text("nome_instalacao").notNull(),
  sigla: text("sigla_instalacao").notNull().unique(),
  tipo: text("tipo_instalacao"),
  situacao: text("situacao"),
  ambiente: text("ambiente"),
  laminaAgua: real("lamina_agua"),
  estado: text("estado"),
  cidade: text("cidade"),
  operadora: text("operadora"),
  campo: text("campo"),
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
  modelo: text("modelo"),
  fabricante: text("fabricante"),
  unidadeMedida: text("unidade_medida"),
  faixaMinEquipamento: real("faixa_min_equipamento"),
  faixaMaxEquipamento: real("faixa_max_equipamento"),
  faixaMinPam: real("faixa_min_pam"),
  faixaMaxPam: real("faixa_max_pam"),
  faixaMinCalibrada: real("faixa_min_calibrada"),
  faixaMaxCalibrada: real("faixa_max_calibrada"),
  instalacaoId: integer("instalacao_id").references(() => instalacoes.id).notNull(),
  poloId: integer("polo_id").references(() => polos.id).notNull(),
  classificacao: text("classificacao"),
  frequenciaCalibracao: integer("frequencia_calibracao_anp"),
  ativoMxm: boolean("ativo_mxm").default(false),
  planoManutencao: text("plano_manutencao_mxm"),
  criterioAceitacao: text("criterio_aceitacao"),
  erroMaximoAdmissivel: real("erro_maximo_admissivel"),
  status: text("status_equipamento").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pontosMedicao = pgTable("pontos_medicao", {
  id: integer("ponto_medicao_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  tag: text("tag_ponto_medicao").notNull().unique(),
  nome: text("nome_ponto_medicao").notNull(),
  classificacao: text("classificacao"),
  localizacao: text("localizacao"),
  tipoMedidorPrimario: text("tipo_medidor_primario"),
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

export const historicoCalibracoes = pgTable("historico_calibracoes", {
  id: integer("historico_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  dataCalibracão: date("data_calibracao").notNull(),
  certificadoNumero: text("certificado_numero"),
  certificadoPath: text("certificado_path"),
  laboratorio: text("laboratorio"),
  resultado: text("resultado"),
  incertezaExpandida: real("incerteza_expandida"),
  responsavel: text("responsavel"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
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
  dataTeste: date("data_teste").notNull(),
  tipoTeste: text("tipo_teste").notNull(),
  vazaoOleo: real("vazao_oleo"),
  vazaoGas: real("vazao_gas"),
  vazaoAgua: real("vazao_agua"),
  bsw: real("bsw"),
  rgo: real("rgo"),
  numeroBoletim: text("numero_boletim"),
  arquivoBtpPath: text("arquivo_btp_path"),
  responsavelTeste: text("responsavel_teste"),
  statusTeste: text("status_teste").notNull().default("pendente"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orifice Plates
export const placasOrificio = pgTable("placas_orificio", {
  id: integer("placa_id").primaryKey().generatedByDefaultAsIdentity(),
  equipamentoId: integer("equipamento_id").references(() => equipamentos.id).notNull(),
  diametroExterno20c: real("diametro_externo_20c"),
  diametroOrificio20c: real("diametro_orificio_20c"),
  espessura: real("espessura"),
  material: text("material"),
  classePressao: text("classe_pressao"),
  dataInspecao: date("data_inspecao"),
  dataInstalacao: date("data_instalacao"),
  dataMaximaUso: date("data_maxima_uso"),
  cartaNumero: text("carta_numero"),
  criterioAceitacao: text("criterio_aceitacao"),
  emaEspecifico: real("ema_especifico"),
  certificadoDimensional: text("certificado_dimensional"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chemical Analysis
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

// Relations
export const polosRelations = relations(polos, ({ many }) => ({
  instalacoes: many(instalacoes),
  equipamentos: many(equipamentos),
  pocos: many(cadastroPocos),
}));

export const instalacoesRelations = relations(instalacoes, ({ one, many }) => ({
  polo: one(polos, {
    fields: [instalacoes.poloId],
    references: [polos.id],
  }),
  equipamentos: many(equipamentos),
  pocos: many(cadastroPocos),
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
  pontosMedicao: many(pontosMedicao),
  planoCalibracoes: many(planoCalibracoes),
  historicoCalibracoes: many(historicoCalibracoes),
  placasOrificio: many(placasOrificio),
}));

export const pontosMedicaoRelations = relations(pontosMedicao, ({ one, many }) => ({
  equipamento: one(equipamentos, {
    fields: [pontosMedicao.equipamentoId],
    references: [equipamentos.id],
  }),
  planoColetas: many(planoColetas),
  analisesQuimicas: many(analisesQuimicas),
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
