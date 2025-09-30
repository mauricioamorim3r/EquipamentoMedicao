import { eq, desc, asc, and, gte, lte, gt, sql, count } from "drizzle-orm";
import { db } from "./db";
import {
  users, polos, campos, instalacoes, equipamentos, pontosMedicao, planoCalibracoes,
  historicoCalibracoes, calendarioCalibracoes, cadastroPocos, testesPocos, placasOrificio, trechosRetos,
  medidoresPrimarios, planoColetas, analisesQuimicas, gestaoCilindros, analisesFisicoQuimicasGenerica,
  analisesCromatografia, analisesPvt, valvulas, controleIncertezas, incertezaLimites, sistemaNotificacoes,
  certificadosCalibração, execucaoCalibracoes,
  type User, type InsertUser, type Polo, type InsertPolo, type Campo, type InsertCampo,
  type Instalacao, type InsertInstalacao, type Equipamento, type InsertEquipamento,
  type PontoMedicao, type InsertPontoMedicao, type PlanoCalibracão, type InsertPlanoCalibracão,
  type CalendarioCalibracao, type InsertCalendarioCalibracao,
  type CadastroPoço, type InsertCadastroPoço,
  type PlacaOrificio, type InsertPlacaOrificio, type TrechoReto, type InsertTrechoReto,
  type PlanoColeta, type InsertPlanoColeta,
  type AnaliseQuimica, type InsertAnaliseQuimica, type GestaoCilindro, type InsertGestaoCilindro,
  type AnaliseFqGenerica, type InsertAnaliseFqGenerica,
  type AnaliseCromatografia, type InsertAnaliseCromatografia,
  type AnalisePvt, type InsertAnalisePvt,
  type Valvula, type InsertValvula,
  type ControleIncerteza, type InsertControleIncerteza, type IncertezaLimite,
  type InsertIncertezaLimite, type SistemaNotificacao, type InsertSistemaNotificacao,
  type CertificadoCalibracao, type InsertCertificadoCalibracao,
  type ExecucaoCalibracao, type InsertExecucaoCalibracao
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Polos
  getPolos(): Promise<Polo[]>;
  getPolo(id: number): Promise<Polo | undefined>;
  createPolo(polo: InsertPolo): Promise<Polo>;
  updatePolo(id: number, polo: Partial<InsertPolo>): Promise<Polo>;
  deletePolo(id: number): Promise<void>;

  // Campos
  getCampos(poloId?: number): Promise<Campo[]>;
  getCampo(id: number): Promise<Campo | undefined>;
  createCampo(campo: InsertCampo): Promise<Campo>;
  updateCampo(id: number, campo: Partial<InsertCampo>): Promise<Campo>;
  deleteCampo(id: number): Promise<void>;

  // Instalações
  getInstalacoes(poloId?: number): Promise<Instalacao[]>;
  getInstalacao(id: number): Promise<Instalacao | undefined>;
  createInstalacao(instalacao: InsertInstalacao): Promise<Instalacao>;
  updateInstalacao(id: number, instalacao: Partial<InsertInstalacao>): Promise<Instalacao>;
  deleteInstalacao(id: number): Promise<void>;

  // Equipamentos
  getEquipamentos(filters?: { poloId?: number; instalacaoId?: number; status?: string }): Promise<Equipamento[]>;
  getEquipamento(id: number): Promise<Equipamento | undefined>;
  createEquipamento(equipamento: InsertEquipamento): Promise<Equipamento>;
  updateEquipamento(id: number, equipamento: Partial<InsertEquipamento>): Promise<Equipamento>;
  deleteEquipamento(id: number): Promise<void>;
  getEquipamentosWithCalibrationStatus(): Promise<any[]>;

  // Pontos de Medição
  getPontosMedicao(equipamentoId?: number): Promise<PontoMedicao[]>;
  getPontoMedicao(id: number): Promise<PontoMedicao | undefined>;
  createPontoMedicao(ponto: InsertPontoMedicao): Promise<PontoMedicao>;
  updatePontoMedicao(id: number, ponto: Partial<InsertPontoMedicao>): Promise<PontoMedicao>;
  deletePontoMedicao(id: number): Promise<void>;

  // Planos de Calibração
  getPlanoCalibracoes(equipamentoId?: number): Promise<PlanoCalibracão[]>;
  getPlanoCalibracão(id: number): Promise<PlanoCalibracão | undefined>;
  createPlanoCalibracão(plano: InsertPlanoCalibracão): Promise<PlanoCalibracão>;
  updatePlanoCalibracão(id: number, plano: Partial<InsertPlanoCalibracão>): Promise<PlanoCalibracão>;
  deletePlanoCalibracão(id: number): Promise<void>;

  // Poços
  getPocos(filters?: { poloId?: number; instalacaoId?: number }): Promise<CadastroPoço[]>;
  getPoco(id: number): Promise<CadastroPoço | undefined>;
  createPoco(poco: InsertCadastroPoço): Promise<CadastroPoço>;
  updatePoco(id: number, poco: Partial<InsertCadastroPoço>): Promise<CadastroPoço>;
  deletePoco(id: number): Promise<void>;

  // Placas de Orifício
  getPlacasOrificio(filters?: { equipamentoId?: number; status?: string }): Promise<PlacaOrificio[]>;
  getPlacaOrificio(id: number): Promise<PlacaOrificio | undefined>;
  createPlacaOrificio(placa: InsertPlacaOrificio): Promise<PlacaOrificio>;
  updatePlacaOrificio(id: number, placa: Partial<InsertPlacaOrificio>): Promise<PlacaOrificio>;
  deletePlacaOrificio(id: number): Promise<void>;

  // Plano de Coleta
  getPlanoColetas(pocoId?: number): Promise<PlanoColeta[]>;
  getPlanoColeta(id: number): Promise<PlanoColeta | undefined>;
  createPlanoColeta(plano: InsertPlanoColeta): Promise<PlanoColeta>;
  updatePlanoColeta(id: number, plano: Partial<InsertPlanoColeta>): Promise<PlanoColeta>;
  deletePlanoColeta(id: number): Promise<void>;

  // Análises Químicas
  getAnalisesQuimicas(pocoId?: number): Promise<AnaliseQuimica[]>;
  getAnaliseQuimica(id: number): Promise<AnaliseQuimica | undefined>;
  createAnaliseQuimica(analise: InsertAnaliseQuimica): Promise<AnaliseQuimica>;
  updateAnaliseQuimica(id: number, analise: Partial<InsertAnaliseQuimica>): Promise<AnaliseQuimica>;
  deleteAnaliseQuimica(id: number): Promise<void>;

  // Válvulas
  getValvulas(equipamentoId?: number): Promise<Valvula[]>;
  getValvula(id: number): Promise<Valvula | undefined>;
  createValvula(valvula: InsertValvula): Promise<Valvula>;
  updateValvula(id: number, valvula: Partial<InsertValvula>): Promise<Valvula>;
  deleteValvula(id: number): Promise<void>;

  // Controle de Incertezas
  getControleIncertezas(equipamentoId?: number): Promise<ControleIncerteza[]>;
  getControleIncerteza(id: number): Promise<ControleIncerteza | undefined>;
  createControleIncerteza(controle: InsertControleIncerteza): Promise<ControleIncerteza>;
  updateControleIncerteza(id: number, controle: Partial<InsertControleIncerteza>): Promise<ControleIncerteza>;
  deleteControleIncerteza(id: number): Promise<void>;

  // Sistema de Notificações
  getNotificacoes(userId?: string): Promise<SistemaNotificacao[]>;
  getNotificacao(id: number): Promise<SistemaNotificacao | undefined>;
  createNotificacao(notificacao: InsertSistemaNotificacao): Promise<SistemaNotificacao>;
  updateNotificacao(id: number, notificacao: Partial<InsertSistemaNotificacao>): Promise<SistemaNotificacao>;
  deleteNotificacao(id: number): Promise<void>;
  markNotificacaoAsRead(id: number): Promise<void>;

  // Calendário de Calibrações
  getCalendarioCalibracoes(filters?: { poloId?: number; instalacaoId?: number; mes?: number; ano?: number }): Promise<CalendarioCalibracao[]>;
  getCalendarioCalibracao(id: number): Promise<CalendarioCalibracao | undefined>;
  createCalendarioCalibracao(calendario: InsertCalendarioCalibracao): Promise<CalendarioCalibracao>;
  updateCalendarioCalibracao(id: number, calendario: Partial<InsertCalendarioCalibracao>): Promise<CalendarioCalibracao>;
  deleteCalendarioCalibracao(id: number): Promise<void>;

  // Trechos Retos
  getTrechosRetos(filters?: { campoId?: number; instalacaoId?: number }): Promise<TrechoReto[]>;
  getTrechoReto(id: number): Promise<TrechoReto | undefined>;
  createTrechoReto(trecho: InsertTrechoReto): Promise<TrechoReto>;
  updateTrechoReto(id: number, trecho: Partial<InsertTrechoReto>): Promise<TrechoReto>;
  deleteTrechoReto(id: number): Promise<void>;

  // Medidores Primários
  getMedidoresPrimarios(filters?: { campoId?: number; instalacaoId?: number; tipoMedidor?: string }): Promise<any[]>;
  getMedidorPrimario(id: number): Promise<any | undefined>;
  createMedidorPrimario(medidor: any): Promise<any>;
  updateMedidorPrimario(id: number, medidor: any): Promise<any>;
  deleteMedidorPrimario(id: number): Promise<void>;

  // Gestão de Cilindros
  getGestaoCilindros(poloId?: number): Promise<GestaoCilindro[]>;
  getGestaoCilindro(id: number): Promise<GestaoCilindro | undefined>;
  createGestaoCilindro(cilindro: InsertGestaoCilindro): Promise<GestaoCilindro>;
  updateGestaoCilindro(id: number, cilindro: Partial<InsertGestaoCilindro>): Promise<GestaoCilindro>;
  deleteGestaoCilindro(id: number): Promise<void>;

  // Análises FQ Genérica
  getAnalisesFqGenerica(filters?: { poloId?: number; instalacaoId?: number }): Promise<AnaliseFqGenerica[]>;
  getAnaliseFqGenerica(id: number): Promise<AnaliseFqGenerica | undefined>;
  createAnaliseFqGenerica(analise: InsertAnaliseFqGenerica): Promise<AnaliseFqGenerica>;
  updateAnaliseFqGenerica(id: number, analise: Partial<InsertAnaliseFqGenerica>): Promise<AnaliseFqGenerica>;
  deleteAnaliseFqGenerica(id: number): Promise<void>;

  // Análises Cromatografia
  getAnalisesCromatografia(filters?: { poloId?: number; instalacaoId?: number }): Promise<AnaliseCromatografia[]>;
  getAnaliseCromatografia(id: number): Promise<AnaliseCromatografia | undefined>;
  createAnaliseCromatografia(analise: InsertAnaliseCromatografia): Promise<AnaliseCromatografia>;
  updateAnaliseCromatografia(id: number, analise: Partial<InsertAnaliseCromatografia>): Promise<AnaliseCromatografia>;
  deleteAnaliseCromatografia(id: number): Promise<void>;

  // Análises PVT
  getAnalisesPvt(filters?: { poloId?: number; pocoId?: number }): Promise<AnalisePvt[]>;
  getAnalisePvt(id: number): Promise<AnalisePvt | undefined>;
  createAnalisePvt(analise: InsertAnalisePvt): Promise<AnalisePvt>;
  updateAnalisePvt(id: number, analise: Partial<InsertAnalisePvt>): Promise<AnalisePvt>;
  deleteAnalisePvt(id: number): Promise<void>;
}

export class Storage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Polos
  async getPolos(): Promise<Polo[]> {
    return await db.select().from(polos).orderBy(asc(polos.nome));
  }

  async getPolo(id: number): Promise<Polo | undefined> {
    const result = await db.select().from(polos).where(eq(polos.id, id));
    return result[0];
  }

  async createPolo(polo: InsertPolo): Promise<Polo> {
    const result = await db.insert(polos).values(polo).returning();
    return result[0];
  }

  async updatePolo(id: number, polo: Partial<InsertPolo>): Promise<Polo> {
    const result = await db.update(polos).set(polo).where(eq(polos.id, id)).returning();
    return result[0];
  }

  async deletePolo(id: number): Promise<void> {
    await db.delete(polos).where(eq(polos.id, id));
  }

  // Campos
  async getCampos(poloId?: number): Promise<Campo[]> {
    let query = db.select().from(campos);
    if (poloId) {
      query = query.where(eq(campos.poloId, poloId)) as any;
    }
    return await query.orderBy(asc(campos.nome));
  }

  async getCampo(id: number): Promise<Campo | undefined> {
    const result = await db.select().from(campos).where(eq(campos.id, id));
    return result[0];
  }

  async createCampo(campo: InsertCampo): Promise<Campo> {
    const result = await db.insert(campos).values(campo).returning();
    return result[0];
  }

  async updateCampo(id: number, campo: Partial<InsertCampo>): Promise<Campo> {
    const result = await db.update(campos).set(campo).where(eq(campos.id, id)).returning();
    return result[0];
  }

  async deleteCampo(id: number): Promise<void> {
    await db.delete(campos).where(eq(campos.id, id));
  }

  // Instalações
  async getInstalacoes(poloId?: number): Promise<Instalacao[]> {
    let query = db.select().from(instalacoes);
    if (poloId) {
      query = query.where(eq(instalacoes.poloId, poloId)) as any;
    }
    return await query.orderBy(asc(instalacoes.nome));
  }

  async getInstalacao(id: number): Promise<Instalacao | undefined> {
    const result = await db.select().from(instalacoes).where(eq(instalacoes.id, id));
    return result[0];
  }

  async createInstalacao(instalacao: InsertInstalacao): Promise<Instalacao> {
    const result = await db.insert(instalacoes).values(instalacao).returning();
    return result[0];
  }

  async updateInstalacao(id: number, instalacao: Partial<InsertInstalacao>): Promise<Instalacao> {
    const result = await db.update(instalacoes).set(instalacao).where(eq(instalacoes.id, id)).returning();
    return result[0];
  }

  async deleteInstalacao(id: number): Promise<void> {
    await db.delete(instalacoes).where(eq(instalacoes.id, id));
  }

  // Equipamentos
  async getEquipamentos(filters?: { poloId?: number; instalacaoId?: number; status?: string }): Promise<Equipamento[]> {
    let query = db.select().from(equipamentos);
    
    if (filters) {
      const conditions = [];
      if (filters.poloId) conditions.push(eq(equipamentos.poloId, filters.poloId));
      if (filters.instalacaoId) conditions.push(eq(equipamentos.instalacaoId, filters.instalacaoId));
      if (filters.status) conditions.push(eq(equipamentos.status, filters.status));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
    }
    
    return await query.orderBy(asc(equipamentos.tag));
  }

  async getEquipamento(id: number): Promise<Equipamento | undefined> {
    const result = await db.select().from(equipamentos).where(eq(equipamentos.id, id));
    return result[0];
  }

  async createEquipamento(equipamento: InsertEquipamento): Promise<Equipamento> {
    const result = await db.insert(equipamentos).values(equipamento).returning();
    return result[0];
  }

  async updateEquipamento(id: number, equipamento: Partial<InsertEquipamento>): Promise<Equipamento> {
    const result = await db.update(equipamentos).set(equipamento).where(eq(equipamentos.id, id)).returning();
    return result[0];
  }

  async deleteEquipamento(id: number): Promise<void> {
    await db.delete(equipamentos).where(eq(equipamentos.id, id));
  }

  async getEquipamentosWithCalibrationStatus(): Promise<any[]> {
    return await db.select({
      id: equipamentos.id,
      tag: equipamentos.tag,
      nome: equipamentos.nome,
      status: equipamentos.status,
    }).from(equipamentos).orderBy(asc(equipamentos.tag));
  }

  // Pontos de Medição
  async getPontosMedicao(equipamentoId?: number): Promise<PontoMedicao[]> {
    let query = db.select().from(pontosMedicao);
    // pontosMedicao não tem mais equipamentoId, use poloId ou instalacaoId se necessário
    return await query.orderBy(asc(pontosMedicao.tag));
  }

  async getPontoMedicao(id: number): Promise<PontoMedicao | undefined> {
    const result = await db.select().from(pontosMedicao).where(eq(pontosMedicao.id, id));
    return result[0];
  }

  async createPontoMedicao(ponto: InsertPontoMedicao): Promise<PontoMedicao> {
    const result = await db.insert(pontosMedicao).values(ponto).returning();
    return result[0];
  }

  async updatePontoMedicao(id: number, ponto: Partial<InsertPontoMedicao>): Promise<PontoMedicao> {
    const result = await db.update(pontosMedicao).set(ponto).where(eq(pontosMedicao.id, id)).returning();
    return result[0];
  }

  async deletePontoMedicao(id: number): Promise<void> {
    await db.delete(pontosMedicao).where(eq(pontosMedicao.id, id));
  }

  // Planos de Calibração
  async getPlanoCalibracoes(equipamentoId?: number): Promise<PlanoCalibracão[]> {
    let query = db.select().from(planoCalibracoes);
    if (equipamentoId) {
      query = query.where(eq(planoCalibracoes.equipamentoId, equipamentoId)) as any;
    }
    return await query.orderBy(desc(planoCalibracoes.createdAt));
  }

  async getPlanoCalibracão(id: number): Promise<PlanoCalibracão | undefined> {
    const result = await db.select().from(planoCalibracoes).where(eq(planoCalibracoes.id, id));
    return result[0];
  }

  async createPlanoCalibracão(plano: InsertPlanoCalibracão): Promise<PlanoCalibracão> {
    const result = await db.insert(planoCalibracoes).values(plano).returning();
    return result[0];
  }

  async updatePlanoCalibracão(id: number, plano: Partial<InsertPlanoCalibracão>): Promise<PlanoCalibracão> {
    const result = await db.update(planoCalibracoes).set(plano).where(eq(planoCalibracoes.id, id)).returning();
    return result[0];
  }

  async deletePlanoCalibracão(id: number): Promise<void> {
    await db.delete(planoCalibracoes).where(eq(planoCalibracoes.id, id));
  }

  // Poços
  async getPocos(filters?: { poloId?: number; instalacaoId?: number }): Promise<CadastroPoço[]> {
    let query = db.select().from(cadastroPocos);
    
    if (filters) {
      const conditions = [];
      if (filters.poloId) conditions.push(eq(cadastroPocos.poloId, filters.poloId));
      if (filters.instalacaoId) conditions.push(eq(cadastroPocos.instalacaoId, filters.instalacaoId));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
    }
    
    return await query.orderBy(asc(cadastroPocos.nome));
  }

  async getPoco(id: number): Promise<CadastroPoço | undefined> {
    const result = await db.select().from(cadastroPocos).where(eq(cadastroPocos.id, id));
    return result[0];
  }

  async createPoco(poco: InsertCadastroPoço): Promise<CadastroPoço> {
    const result = await db.insert(cadastroPocos).values(poco).returning();
    return result[0];
  }

  async updatePoco(id: number, poco: Partial<InsertCadastroPoço>): Promise<CadastroPoço> {
    const result = await db.update(cadastroPocos).set(poco).where(eq(cadastroPocos.id, id)).returning();
    return result[0];
  }

  async deletePoco(id: number): Promise<void> {
    await db.delete(cadastroPocos).where(eq(cadastroPocos.id, id));
  }

  // Placas de Orifício
  async getPlacasOrificio(filters?: { equipamentoId?: number; status?: string }): Promise<PlacaOrificio[]> {
    let query = db.select().from(placasOrificio);
    
    if (filters) {
      const conditions = [];
      if (filters.equipamentoId) conditions.push(eq(placasOrificio.equipamentoId, filters.equipamentoId));
      // Status não existe em placasOrificio
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
    }
    
    return await query.orderBy(asc(placasOrificio.id));
  }

  async getPlacaOrificio(id: number): Promise<PlacaOrificio | undefined> {
    const result = await db.select().from(placasOrificio).where(eq(placasOrificio.id, id));
    return result[0];
  }

  async createPlacaOrificio(placa: InsertPlacaOrificio): Promise<PlacaOrificio> {
    const result = await db.insert(placasOrificio).values(placa).returning();
    return result[0];
  }

  async updatePlacaOrificio(id: number, placa: Partial<InsertPlacaOrificio>): Promise<PlacaOrificio> {
    const result = await db.update(placasOrificio).set(placa).where(eq(placasOrificio.id, id)).returning();
    return result[0];
  }

  async deletePlacaOrificio(id: number): Promise<void> {
    await db.delete(placasOrificio).where(eq(placasOrificio.id, id));
  }

  // Plano de Coleta
  async getPlanoColetas(pocoId?: number): Promise<PlanoColeta[]> {
    let query = db.select().from(planoColetas);
    if (pocoId) {
      query = query.where(eq(planoColetas.pontoMedicaoId, pocoId)) as any;
    }
    return await query.orderBy(desc(planoColetas.createdAt));
  }

  async getPlanoColeta(id: number): Promise<PlanoColeta | undefined> {
    const result = await db.select().from(planoColetas).where(eq(planoColetas.id, id));
    return result[0];
  }

  async createPlanoColeta(plano: InsertPlanoColeta): Promise<PlanoColeta> {
    const result = await db.insert(planoColetas).values(plano).returning();
    return result[0];
  }

  async updatePlanoColeta(id: number, plano: Partial<InsertPlanoColeta>): Promise<PlanoColeta> {
    const result = await db.update(planoColetas).set(plano).where(eq(planoColetas.id, id)).returning();
    return result[0];
  }

  async deletePlanoColeta(id: number): Promise<void> {
    await db.delete(planoColetas).where(eq(planoColetas.id, id));
  }

  // Análises Químicas
  async getAnalisesQuimicas(pocoId?: number): Promise<AnaliseQuimica[]> {
    let query = db.select().from(analisesQuimicas);
    if (pocoId) {
      query = query.where(eq(analisesQuimicas.pontoMedicaoId, pocoId)) as any;
    }
    return await query.orderBy(desc(analisesQuimicas.createdAt));
  }

  async getAnaliseQuimica(id: number): Promise<AnaliseQuimica | undefined> {
    const result = await db.select().from(analisesQuimicas).where(eq(analisesQuimicas.id, id));
    return result[0];
  }

  async createAnaliseQuimica(analise: InsertAnaliseQuimica): Promise<AnaliseQuimica> {
    const result = await db.insert(analisesQuimicas).values(analise).returning();
    return result[0];
  }

  async updateAnaliseQuimica(id: number, analise: Partial<InsertAnaliseQuimica>): Promise<AnaliseQuimica> {
    const result = await db.update(analisesQuimicas).set(analise).where(eq(analisesQuimicas.id, id)).returning();
    return result[0];
  }

  async deleteAnaliseQuimica(id: number): Promise<void> {
    await db.delete(analisesQuimicas).where(eq(analisesQuimicas.id, id));
  }

  // Válvulas
  async getValvulas(equipamentoId?: number): Promise<Valvula[]> {
    let query = db.select().from(valvulas);
    if (equipamentoId) {
      query = query.where(eq(valvulas.equipamentoId, equipamentoId)) as any;
    }
    return await query.orderBy(asc(valvulas.tagValvula));
  }

  async getValvula(id: number): Promise<Valvula | undefined> {
    const result = await db.select().from(valvulas).where(eq(valvulas.id, id));
    return result[0];
  }

  async createValvula(valvula: InsertValvula): Promise<Valvula> {
    const result = await db.insert(valvulas).values(valvula).returning();
    return result[0];
  }

  async updateValvula(id: number, valvula: Partial<InsertValvula>): Promise<Valvula> {
    const result = await db.update(valvulas).set(valvula).where(eq(valvulas.id, id)).returning();
    return result[0];
  }

  async deleteValvula(id: number): Promise<void> {
    await db.delete(valvulas).where(eq(valvulas.id, id));
  }

  // Controle de Incertezas
  async getControleIncertezas(equipamentoId?: number): Promise<ControleIncerteza[]> {
    let query = db.select().from(controleIncertezas);
    // controleIncertezas não tem mais equipamentoId, use pontoMedicaoId se necessário
    return await query.orderBy(desc(controleIncertezas.createdAt));
  }

  async getControleIncerteza(id: number): Promise<ControleIncerteza | undefined> {
    const result = await db.select().from(controleIncertezas).where(eq(controleIncertezas.id, id));
    return result[0];
  }

  async createControleIncerteza(controle: InsertControleIncerteza): Promise<ControleIncerteza> {
    const result = await db.insert(controleIncertezas).values(controle).returning();
    return result[0];
  }

  async updateControleIncerteza(id: number, controle: Partial<InsertControleIncerteza>): Promise<ControleIncerteza> {
    const result = await db.update(controleIncertezas).set(controle).where(eq(controleIncertezas.id, id)).returning();
    return result[0];
  }

  async deleteControleIncerteza(id: number): Promise<void> {
    await db.delete(controleIncertezas).where(eq(controleIncertezas.id, id));
  }

  // Sistema de Notificações
  async getNotificacoes(userId?: string): Promise<SistemaNotificacao[]> {
    let query = db.select().from(sistemaNotificacoes);
    if (userId) {
      // userId não existe em sistemaNotificacoes
    }
    return await query.orderBy(desc(sistemaNotificacoes.createdAt));
  }

  async getNotificacao(id: number): Promise<SistemaNotificacao | undefined> {
    const result = await db.select().from(sistemaNotificacoes).where(eq(sistemaNotificacoes.id, id));
    return result[0];
  }

  async createNotificacao(notificacao: InsertSistemaNotificacao): Promise<SistemaNotificacao> {
    const result = await db.insert(sistemaNotificacoes).values(notificacao).returning();
    return result[0];
  }

  async updateNotificacao(id: number, notificacao: Partial<InsertSistemaNotificacao>): Promise<SistemaNotificacao> {
    const result = await db.update(sistemaNotificacoes).set(notificacao).where(eq(sistemaNotificacoes.id, id)).returning();
    return result[0];
  }

  async deleteNotificacao(id: number): Promise<void> {
    await db.delete(sistemaNotificacoes).where(eq(sistemaNotificacoes.id, id));
  }

  async markNotificacaoAsRead(id: number): Promise<void> {
    await db.update(sistemaNotificacoes).set({ status: 'lida' }).where(eq(sistemaNotificacoes.id, id));
  }

  // Calendário de Calibrações
  async getCalendarioCalibracoes(filters?: { poloId?: number; instalacaoId?: number; mes?: number; ano?: number }): Promise<CalendarioCalibracao[]> {
    let query = db.select().from(calendarioCalibracoes);
    const conditions = [];

    if (filters?.poloId) conditions.push(eq(calendarioCalibracoes.poloId, filters.poloId));
    if (filters?.instalacaoId) conditions.push(eq(calendarioCalibracoes.instalacaoId, filters.instalacaoId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(calendarioCalibracoes.previsaoCalibracao));
  }

  async getCalendarioCalibracao(id: number): Promise<CalendarioCalibracao | undefined> {
    const result = await db.select().from(calendarioCalibracoes).where(eq(calendarioCalibracoes.id, id));
    return result[0];
  }

  async createCalendarioCalibracao(calendario: InsertCalendarioCalibracao): Promise<CalendarioCalibracao> {
    const result = await db.insert(calendarioCalibracoes).values(calendario).returning();
    return result[0];
  }

  async updateCalendarioCalibracao(id: number, calendario: Partial<InsertCalendarioCalibracao>): Promise<CalendarioCalibracao> {
    const result = await db.update(calendarioCalibracoes).set(calendario).where(eq(calendarioCalibracoes.id, id)).returning();
    return result[0];
  }

  async deleteCalendarioCalibracao(id: number): Promise<void> {
    await db.delete(calendarioCalibracoes).where(eq(calendarioCalibracoes.id, id));
  }

  // Trechos Retos
  async getTrechosRetos(filters?: { campoId?: number; instalacaoId?: number }): Promise<TrechoReto[]> {
    let query = db.select().from(trechosRetos);
    const conditions = [];

    if (filters?.campoId) conditions.push(eq(trechosRetos.campoId, filters.campoId));
    if (filters?.instalacaoId) conditions.push(eq(trechosRetos.instalacaoId, filters.instalacaoId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(asc(trechosRetos.numeroSerie));
  }

  async getTrechoReto(id: number): Promise<TrechoReto | undefined> {
    const result = await db.select().from(trechosRetos).where(eq(trechosRetos.id, id));
    return result[0];
  }

  async createTrechoReto(trecho: InsertTrechoReto): Promise<TrechoReto> {
    const result = await db.insert(trechosRetos).values(trecho).returning();
    return result[0];
  }

  async updateTrechoReto(id: number, trecho: Partial<InsertTrechoReto>): Promise<TrechoReto> {
    const result = await db.update(trechosRetos).set(trecho).where(eq(trechosRetos.id, id)).returning();
    return result[0];
  }

  async deleteTrechoReto(id: number): Promise<void> {
    await db.delete(trechosRetos).where(eq(trechosRetos.id, id));
  }

  // Medidores Primários
  async getMedidoresPrimarios(filters?: { campoId?: number; instalacaoId?: number; tipoMedidor?: string }): Promise<any[]> {
    const conditions = [];
    
    if (filters?.campoId) {
      conditions.push(eq(medidoresPrimarios.campoId, filters.campoId));
    }
    if (filters?.instalacaoId) {
      conditions.push(eq(medidoresPrimarios.instalacaoId, filters.instalacaoId));
    }
    if (filters?.tipoMedidor) {
      conditions.push(eq(medidoresPrimarios.tipoMedidor, filters.tipoMedidor));
    }

    let query = db.select().from(medidoresPrimarios);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(asc(medidoresPrimarios.numeroSerie));
  }

  async getMedidorPrimario(id: number): Promise<any | undefined> {
    const result = await db.select().from(medidoresPrimarios).where(eq(medidoresPrimarios.id, id));
    return result[0];
  }

  async createMedidorPrimario(medidor: any): Promise<any> {
    const result = await db.insert(medidoresPrimarios).values(medidor).returning();
    return result[0];
  }

  async updateMedidorPrimario(id: number, medidor: any): Promise<any> {
    const result = await db.update(medidoresPrimarios).set(medidor).where(eq(medidoresPrimarios.id, id)).returning();
    return result[0];
  }

  async deleteMedidorPrimario(id: number): Promise<void> {
    await db.delete(medidoresPrimarios).where(eq(medidoresPrimarios.id, id));
  }

  // Gestão de Cilindros
  async getGestaoCilindros(poloId?: number): Promise<GestaoCilindro[]> {
    let query = db.select().from(gestaoCilindros);
    if (poloId) {
      query = query.where(eq(gestaoCilindros.poloId, poloId)) as any;
    }
    return await query.orderBy(desc(gestaoCilindros.dataSolicitacaoCilindros));
  }

  async getGestaoCilindro(id: number): Promise<GestaoCilindro | undefined> {
    const result = await db.select().from(gestaoCilindros).where(eq(gestaoCilindros.id, id));
    return result[0];
  }

  async createGestaoCilindro(cilindro: InsertGestaoCilindro): Promise<GestaoCilindro> {
    const result = await db.insert(gestaoCilindros).values(cilindro).returning();
    return result[0];
  }

  async updateGestaoCilindro(id: number, cilindro: Partial<InsertGestaoCilindro>): Promise<GestaoCilindro> {
    const result = await db.update(gestaoCilindros).set(cilindro).where(eq(gestaoCilindros.id, id)).returning();
    return result[0];
  }

  async deleteGestaoCilindro(id: number): Promise<void> {
    await db.delete(gestaoCilindros).where(eq(gestaoCilindros.id, id));
  }

  // Análises FQ Genérica
  async getAnalisesFqGenerica(filters?: { poloId?: number; instalacaoId?: number }): Promise<AnaliseFqGenerica[]> {
    let query = db.select().from(analisesFisicoQuimicasGenerica);
    const conditions = [];

    if (filters?.poloId) conditions.push(eq(analisesFisicoQuimicasGenerica.poloId, filters.poloId));
    if (filters?.instalacaoId) conditions.push(eq(analisesFisicoQuimicasGenerica.instalacaoId, filters.instalacaoId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(analisesFisicoQuimicasGenerica.dataColeta));
  }

  async getAnaliseFqGenerica(id: number): Promise<AnaliseFqGenerica | undefined> {
    const result = await db.select().from(analisesFisicoQuimicasGenerica).where(eq(analisesFisicoQuimicasGenerica.id, id));
    return result[0];
  }

  async createAnaliseFqGenerica(analise: InsertAnaliseFqGenerica): Promise<AnaliseFqGenerica> {
    const result = await db.insert(analisesFisicoQuimicasGenerica).values(analise).returning();
    return result[0];
  }

  async updateAnaliseFqGenerica(id: number, analise: Partial<InsertAnaliseFqGenerica>): Promise<AnaliseFqGenerica> {
    const result = await db.update(analisesFisicoQuimicasGenerica).set(analise).where(eq(analisesFisicoQuimicasGenerica.id, id)).returning();
    return result[0];
  }

  async deleteAnaliseFqGenerica(id: number): Promise<void> {
    await db.delete(analisesFisicoQuimicasGenerica).where(eq(analisesFisicoQuimicasGenerica.id, id));
  }

  // Análises Cromatografia
  async getAnalisesCromatografia(filters?: { poloId?: number; instalacaoId?: number }): Promise<AnaliseCromatografia[]> {
    let query = db.select().from(analisesCromatografia);
    const conditions = [];

    if (filters?.poloId) conditions.push(eq(analisesCromatografia.poloId, filters.poloId));
    if (filters?.instalacaoId) conditions.push(eq(analisesCromatografia.instalacaoId, filters.instalacaoId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(analisesCromatografia.dataColeta));
  }

  async getAnaliseCromatografia(id: number): Promise<AnaliseCromatografia | undefined> {
    const result = await db.select().from(analisesCromatografia).where(eq(analisesCromatografia.id, id));
    return result[0];
  }

  async createAnaliseCromatografia(analise: InsertAnaliseCromatografia): Promise<AnaliseCromatografia> {
    const result = await db.insert(analisesCromatografia).values(analise).returning();
    return result[0];
  }

  async updateAnaliseCromatografia(id: number, analise: Partial<InsertAnaliseCromatografia>): Promise<AnaliseCromatografia> {
    const result = await db.update(analisesCromatografia).set(analise).where(eq(analisesCromatografia.id, id)).returning();
    return result[0];
  }

  async deleteAnaliseCromatografia(id: number): Promise<void> {
    await db.delete(analisesCromatografia).where(eq(analisesCromatografia.id, id));
  }

  // Análises PVT
  async getAnalisesPvt(filters?: { poloId?: number; pocoId?: number }): Promise<AnalisePvt[]> {
    let query = db.select().from(analisesPvt);
    const conditions = [];

    if (filters?.poloId) conditions.push(eq(analisesPvt.poloId, filters.poloId));
    if (filters?.pocoId) conditions.push(eq(analisesPvt.pocoId, filters.pocoId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(analisesPvt.dataColeta));
  }

  async getAnalisePvt(id: number): Promise<AnalisePvt | undefined> {
    const result = await db.select().from(analisesPvt).where(eq(analisesPvt.id, id));
    return result[0];
  }

  async createAnalisePvt(analise: InsertAnalisePvt): Promise<AnalisePvt> {
    const result = await db.insert(analisesPvt).values(analise).returning();
    return result[0];
  }

  async updateAnalisePvt(id: number, analise: Partial<InsertAnalisePvt>): Promise<AnalisePvt> {
    const result = await db.update(analisesPvt).set(analise).where(eq(analisesPvt.id, id)).returning();
    return result[0];
  }

  async deleteAnalisePvt(id: number): Promise<void> {
    await db.delete(analisesPvt).where(eq(analisesPvt.id, id));
  }

  // Certificados de Calibração
  async getCertificadosCalibração(): Promise<CertificadoCalibracao[]> {
    return await db.select().from(certificadosCalibração).orderBy(desc(certificadosCalibração.dataCertificado));
  }

  async getCertificadoCalibracao(id: number): Promise<CertificadoCalibracao | undefined> {
    const result = await db.select().from(certificadosCalibração).where(eq(certificadosCalibração.id, id));
    return result[0];
  }

  async createCertificadoCalibracao(certificado: InsertCertificadoCalibracao): Promise<CertificadoCalibracao> {
    const result = await db.insert(certificadosCalibração).values(certificado).returning();
    return result[0];
  }

  async updateCertificadoCalibracao(id: number, certificado: Partial<InsertCertificadoCalibracao>): Promise<CertificadoCalibracao> {
    const result = await db.update(certificadosCalibração).set(certificado).where(eq(certificadosCalibração.id, id)).returning();
    return result[0];
  }

  async deleteCertificadoCalibracao(id: number): Promise<void> {
    await db.delete(certificadosCalibração).where(eq(certificadosCalibração.id, id));
  }

  // Execução de Calibrações
  async getExecucaoCalibracoes(): Promise<ExecucaoCalibracao[]> {
    return await db.select().from(execucaoCalibracoes).orderBy(desc(execucaoCalibracoes.createdAt));
  }

  async getExecucaoCalibracao(id: number): Promise<ExecucaoCalibracao | undefined> {
    const result = await db.select().from(execucaoCalibracoes).where(eq(execucaoCalibracoes.id, id));
    return result[0];
  }

  async createExecucaoCalibracao(execucao: InsertExecucaoCalibracao): Promise<ExecucaoCalibracao> {
    // Lógica de rotação de certificados: quando um novo certificado é inserido,
    // mover último -> penúltimo -> antepenúltimo
    const existing = await db.select().from(execucaoCalibracoes)
      .where(eq(execucaoCalibracoes.equipamentoId, execucao.equipamentoId));
    
    if (existing.length > 0) {
      const current = existing[0];
      // Rotacionar certificados: último vira penúltimo, penúltimo vira antepenúltimo
      const updatedData = {
        ...execucao,
        numeroPenultimoCertificado: current.numeroUltimoCertificado,
        revisaoPenultimoCertificado: current.revisaoUltimoCertificado,
        dataPenultimoCertificado: current.dataUltimoCertificado,
        statusPenultimoCertificado: current.statusUltimoCertificado,
        certificadoPenultimoPath: current.certificadoUltimoPath,
        
        numeroAntepenultimoCertificado: current.numeroPenultimoCertificado,
        revisaoAntepenultimoCertificado: current.revisaoPenultimoCertificado,
        dataAntepenultimoCertificado: current.dataPenultimoCertificado,
        statusAntepenultimoCertificado: current.statusPenultimoCertificado,
        certificadoAntepenultimoPath: current.certificadoPenultimoPath,
      };
      
      const result = await db.update(execucaoCalibracoes)
        .set(updatedData)
        .where(eq(execucaoCalibracoes.equipamentoId, execucao.equipamentoId))
        .returning();
      return result[0];
    } else {
      // Primeira execução para este equipamento
      const result = await db.insert(execucaoCalibracoes).values(execucao).returning();
      return result[0];
    }
  }

  async updateExecucaoCalibracao(id: number, execucao: Partial<InsertExecucaoCalibracao>): Promise<ExecucaoCalibracao> {
    const result = await db.update(execucaoCalibracoes).set(execucao).where(eq(execucaoCalibracoes.id, id)).returning();
    return result[0];
  }

  async deleteExecucaoCalibracao(id: number): Promise<void> {
    await db.delete(execucaoCalibracoes).where(eq(execucaoCalibracoes.id, id));
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const [equipamentosCount] = await db.select({ count: count() }).from(equipamentos);
    const [calibracoesCount] = await db.select({ count: count() }).from(planoCalibracoes);
    const [pocosCount] = await db.select({ count: count() }).from(cadastroPocos);
    const [placasCount] = await db.select({ count: count() }).from(placasOrificio);

    // Get distribution by polos with equipment counts
    const polosWithCounts = await db
      .select({
        id: polos.id,
        nome: polos.nome,
        sigla: polos.sigla,
        equipCount: count(equipamentos.id),
      })
      .from(polos)
      .leftJoin(equipamentos, eq(polos.id, equipamentos.poloId))
      .groupBy(polos.id, polos.nome, polos.sigla)
      .orderBy(desc(count(equipamentos.id)));

    return {
      totalEquipamentos: equipamentosCount.count,
      totalCalibracoes: calibracoesCount.count,
      totalPocos: pocosCount.count,
      totalPlacas: placasCount.count,
      polosDistribution: polosWithCounts,
    };
  }

  // Calibration Statistics
  async getCalibrationStats() {
    const allEquipments = await this.getEquipamentosWithCalibrationStatus();

    const total = allEquipments.length;
    const ok = allEquipments.filter((eq: any) => eq.diasParaVencer > 90).length;
    const proximo = allEquipments.filter((eq: any) => eq.diasParaVencer > 30 && eq.diasParaVencer <= 90).length;
    const alert = allEquipments.filter((eq: any) => eq.diasParaVencer > 7 && eq.diasParaVencer <= 30).length;
    const critical = allEquipments.filter((eq: any) => eq.diasParaVencer > 0 && eq.diasParaVencer <= 7).length;
    const expired = allEquipments.filter((eq: any) => eq.diasParaVencer !== undefined && eq.diasParaVencer <= 0).length;

    return {
      total,
      ok,
      proximo,
      alert,
      critical,
      expired,
    };
  }

  // Testes de Poços
  async getTestesPocos(pocoId: number) {
    return await db.select().from(testesPocos)
      .where(eq(testesPocos.pocoId, pocoId))
      .orderBy(desc(testesPocos.dataTeste));
  }

  async createTestePoco(teste: any) {
    const result = await db.insert(testesPocos).values(teste).returning();
    return result[0];
  }

  // Incerteza Limites
  async getIncertezaLimites() {
    return await db.select().from(incertezaLimites)
      .where(eq(incertezaLimites.ativo, true))
      .orderBy(asc(incertezaLimites.fluido), asc(incertezaLimites.classificacao));
  }

  async createIncertezaLimite(limite: InsertIncertezaLimite) {
    const result = await db.insert(incertezaLimites).values(limite).returning();
    return result[0];
  }

  // Unread Notifications Count
  async getUnreadNotificationsCount() {
    const [result] = await db
      .select({ count: count() })
      .from(sistemaNotificacoes)
      .where(eq(sistemaNotificacoes.status, 'ativa'));

    return result.count;
  }
}

export const storage = new Storage();