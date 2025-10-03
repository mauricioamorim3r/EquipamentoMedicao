import { eq, desc, asc, and, gte, lte, gt, sql, count } from "drizzle-orm";
import { db } from "./db";
import {
  users, polos, campos, instalacoes, equipamentos, pontosMedicao, planoCalibracoes,
  historicoCalibracoes, calendarioCalibracoes, cadastroPocos, testesPocos, placasOrificio, trechosRetos,
  medidoresPrimarios, planoColetas, analisesQuimicas, gestaoCilindros, analisesFisicoQuimicasGenerica,
  analisesCromatografia, analisesPvt, valvulas, controleIncertezas, incertezaLimites, sistemaNotificacoes,
  certificadosCalibração, execucaoCalibracoes, lacresFisicos, lacresEletronicos, controleLacres,
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
  type CertificadoCalibracao, type CertificadoCalibracaoWithEquipamento, type InsertCertificadoCalibracao,
  type ExecucaoCalibracao, type ExecucaoCalibracaoWithEquipamento, type InsertExecucaoCalibracao,
  type LacreFisico, type InsertLacreFisico,
  type LacreEletronico, type InsertLacreEletronico,
  type ControleLacre, type InsertControleLacre
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

  // Lacres Físicos
  getLacresFisicos(): Promise<LacreFisico[]>;
  getLacreFisico(id: number): Promise<LacreFisico | undefined>;
  createLacreFisico(lacre: InsertLacreFisico): Promise<LacreFisico>;
  updateLacreFisico(id: number, lacre: Partial<InsertLacreFisico>): Promise<LacreFisico>;
  deleteLacreFisico(id: number): Promise<void>;

  // Lacres Eletrônicos
  getLacresEletronicos(): Promise<LacreEletronico[]>;
  getLacreEletronico(id: number): Promise<LacreEletronico | undefined>;
  createLacreEletronico(lacre: InsertLacreEletronico): Promise<LacreEletronico>;
  updateLacreEletronico(id: number, lacre: Partial<InsertLacreEletronico>): Promise<LacreEletronico>;
  deleteLacreEletronico(id: number): Promise<void>;

  // Controle de Lacres
  getControleLacres(): Promise<ControleLacre[]>;
  getControleLacre(id: number): Promise<ControleLacre | undefined>;
  createControleLacre(controle: InsertControleLacre): Promise<ControleLacre>;
  updateControleLacre(id: number, controle: Partial<InsertControleLacre>): Promise<ControleLacre>;
  deleteControleLacre(id: number): Promise<void>;

  // Calendar Events
  getCalendarEvents(filters?: { month?: number; year?: number }): Promise<any[]>;

  // Certificados de Calibração
  getCertificadosCalibração(): Promise<CertificadoCalibracaoWithEquipamento[]>;
  getCertificadoCalibracao(id: number): Promise<CertificadoCalibracao | undefined>;
  createCertificadoCalibracao(certificado: InsertCertificadoCalibracao): Promise<CertificadoCalibracao>;
  updateCertificadoCalibracao(id: number, certificado: Partial<InsertCertificadoCalibracao>): Promise<CertificadoCalibracao>;
  deleteCertificadoCalibracao(id: number): Promise<void>;

  // Execução de Calibrações
  getExecucaoCalibracoes(): Promise<ExecucaoCalibracaoWithEquipamento[]>;
  getExecucaoCalibracao(id: number): Promise<ExecucaoCalibracao | undefined>;
  createExecucaoCalibracao(execucao: InsertExecucaoCalibracao): Promise<ExecucaoCalibracao>;
  updateExecucaoCalibracao(id: number, execucao: Partial<InsertExecucaoCalibracao>): Promise<ExecucaoCalibracao>;
  deleteExecucaoCalibracao(id: number): Promise<void>;

  // Testes de Poços
  getTestesPocos(pocoId: number): Promise<any[]>;
  getAllTestesPocos(filters?: { poloId?: number; instalacaoId?: number; pocoId?: number }): Promise<any[]>;
  getTestePoco(id: number): Promise<any | null>;
  createTestePoco(teste: any): Promise<any>;
  updateTestePoco(id: number, teste: any): Promise<any | null>;
  deleteTestePoco(id: number): Promise<boolean>;

  // Incerteza Limites
  getIncertezaLimites(): Promise<IncertezaLimite[]>;
  getIncertezaLimite(id: number): Promise<IncertezaLimite | undefined>;
  createIncertezaLimite(limite: InsertIncertezaLimite): Promise<IncertezaLimite>;
  updateIncertezaLimite(id: number, limite: Partial<InsertIncertezaLimite>): Promise<IncertezaLimite>;
  deleteIncertezaLimite(id: number): Promise<void>;

  // Histórico de Calibrações
  getHistoricoCalibracoes(equipamentoId?: number): Promise<any[]>;
  getHistoricoCalibracao(id: number): Promise<any | undefined>;
  createHistoricoCalibracao(historico: any): Promise<any>;
  updateHistoricoCalibracao(id: number, historico: any): Promise<any>;
  deleteHistoricoCalibracao(id: number): Promise<void>;

  // Métodos auxiliares
  getDashboardStats(): Promise<any>;
  getCalibrationStats(): Promise<any>;
  getUnreadNotificationsCount(): Promise<number>;
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
    if (!user || typeof user !== 'object') {
      throw new Error('Invalid user data provided');
    }
    const result = await db.insert(users).values(user as any).returning();
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
    const result = await db.insert(polos).values(polo as any).returning();
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
    const result = await db.insert(campos).values(campo as any).returning();
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
    const result = await db.insert(instalacoes).values(instalacao as any).returning();
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
    const result = await db.insert(equipamentos).values(equipamento as any).returning();
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
    const result = await db.insert(pontosMedicao).values(ponto as any).returning();
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
    const result = await db.insert(planoCalibracoes).values(plano as any).returning();
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
    const result = await db.insert(cadastroPocos).values(poco as any).returning();
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
    const result = await db.insert(placasOrificio).values(placa as any).returning();
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
    const result = await db.insert(planoColetas).values(plano as any).returning();
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
    const result = await db.insert(analisesQuimicas).values(analise as any).returning();
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
    const result = await db.insert(valvulas).values(valvula as any).returning();
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
    const result = await db.insert(controleIncertezas).values(controle as any).returning();
    return result[0];
  }

  async updateControleIncerteza(id: number, controle: Partial<InsertControleIncerteza>): Promise<ControleIncerteza> {
    const result = await db.update(controleIncertezas).set(controle as any).where(eq(controleIncertezas.id, id)).returning();
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
    const result = await db.insert(sistemaNotificacoes).values(notificacao as any).returning();
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
    await db.update(sistemaNotificacoes)
      .set({
        [sistemaNotificacoes.status.name]: 'lida'
      })
      .where(eq(sistemaNotificacoes.id, id));
  }

  // Calendário de Calibrações
  async getCalendarioCalibracoes(filters?: { poloId?: number; instalacaoId?: number; mes?: number; ano?: number }): Promise<CalendarioCalibracao[]> {
    let query = db.select().from(calendarioCalibracoes);
    const conditions = [];

    // Note: poloId and instalacaoId filters removed as these fields don't exist in calendario_calibracoes table
    // if (filters?.poloId) conditions.push(eq(calendarioCalibracoes.poloId, filters.poloId));
    // if (filters?.instalacaoId) conditions.push(eq(calendarioCalibracoes.instalacaoId, filters.instalacaoId));

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
    const result = await db.insert(calendarioCalibracoes).values(calendario as any).returning();
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
    const result = await db.insert(trechosRetos).values(trecho as any).returning();
    return result[0];
  }

  async updateTrechoReto(id: number, trecho: Partial<InsertTrechoReto>): Promise<TrechoReto> {
    const result = await db.update(trechosRetos).set(trecho as any).where(eq(trechosRetos.id, id)).returning();
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
    const result = await db.insert(medidoresPrimarios).values(medidor as any).returning();
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
    const result = await db.insert(gestaoCilindros).values(cilindro as any).returning();
    return result[0];
  }

  async updateGestaoCilindro(id: number, cilindro: Partial<InsertGestaoCilindro>): Promise<GestaoCilindro> {
    const result = await db.update(gestaoCilindros).set(cilindro as any).where(eq(gestaoCilindros.id, id)).returning();
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
    const result = await db.insert(analisesFisicoQuimicasGenerica).values(analise as any).returning();
    return result[0];
  }

  async updateAnaliseFqGenerica(id: number, analise: Partial<InsertAnaliseFqGenerica>): Promise<AnaliseFqGenerica> {
    const result = await db.update(analisesFisicoQuimicasGenerica).set(analise as any).where(eq(analisesFisicoQuimicasGenerica.id, id)).returning();
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
    const result = await db.insert(analisesCromatografia).values(analise as any).returning();
    return result[0];
  }

  async updateAnaliseCromatografia(id: number, analise: Partial<InsertAnaliseCromatografia>): Promise<AnaliseCromatografia> {
    const result = await db.update(analisesCromatografia).set(analise as any).where(eq(analisesCromatografia.id, id)).returning();
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
    const result = await db.insert(analisesPvt).values(analise as any).returning();
    return result[0];
  }

  async updateAnalisePvt(id: number, analise: Partial<InsertAnalisePvt>): Promise<AnalisePvt> {
    const result = await db.update(analisesPvt).set(analise as any).where(eq(analisesPvt.id, id)).returning();
    return result[0];
  }

  async deleteAnalisePvt(id: number): Promise<void> {
    await db.delete(analisesPvt).where(eq(analisesPvt.id, id));
  }

  // Certificados de Calibração
  async getCertificadosCalibração(): Promise<CertificadoCalibracaoWithEquipamento[]> {
    const result = await db.select({
      id: certificadosCalibração.id,
      equipamentoId: certificadosCalibração.equipamentoId,
      numeroCertificado: certificadosCalibração.numeroCertificado,
      revisaoCertificado: certificadosCalibração.revisaoCertificado,
      dataCertificado: certificadosCalibração.dataCertificado,
      statusCertificado: certificadosCalibração.statusCertificado,
      certificadoPath: certificadosCalibração.certificadoPath,
      periodicidadeCalibracao: certificadosCalibração.periodicidadeCalibracao,
      laboratorio: certificadosCalibração.laboratorio,
      responsavelTecnico: certificadosCalibração.responsavelTecnico,
      resultadoCalibracao: certificadosCalibração.resultadoCalibracao,
      incertezaExpandida: certificadosCalibração.incertezaExpandida,
      analiseCriticaResultados: certificadosCalibração.analiseCriticaResultados,
      observacoes: certificadosCalibração.observacoes,
      ordemCertificado: certificadosCalibração.ordemCertificado,
      createdAt: certificadosCalibração.createdAt,
      updatedAt: certificadosCalibração.updatedAt,
      tagEquipamento: equipamentos.tag,
      nomeEquipamento: equipamentos.nome,
      numeroSerieEquipamento: equipamentos.numeroSerie
    })
    .from(certificadosCalibração)
    .leftJoin(equipamentos, eq(certificadosCalibração.equipamentoId, equipamentos.id))
    .orderBy(desc(certificadosCalibração.dataCertificado));
    
    return result as CertificadoCalibracaoWithEquipamento[];
  }

  async getCertificadoCalibracao(id: number): Promise<CertificadoCalibracao | undefined> {
    const result = await db.select().from(certificadosCalibração).where(eq(certificadosCalibração.id, id));
    return result[0];
  }

  async createCertificadoCalibracao(certificado: InsertCertificadoCalibracao): Promise<CertificadoCalibracao> {
    const result = await db.insert(certificadosCalibração).values(certificado as any).returning();
    return result[0];
  }

  async updateCertificadoCalibracao(id: number, certificado: Partial<InsertCertificadoCalibracao>): Promise<CertificadoCalibracao> {
    const result = await db.update(certificadosCalibração).set(certificado as any).where(eq(certificadosCalibração.id, id)).returning();
    return result[0];
  }

  async deleteCertificadoCalibracao(id: number): Promise<void> {
    await db.delete(certificadosCalibração).where(eq(certificadosCalibração.id, id));
  }

  // Execução de Calibrações
  async getExecucaoCalibracoes(): Promise<ExecucaoCalibracaoWithEquipamento[]> {
    const result = await db.select({
      id: execucaoCalibracoes.id,
      equipamentoId: execucaoCalibracoes.equipamentoId,
      aplicabilidade: execucaoCalibracoes.aplicabilidade,
      fluido: execucaoCalibracoes.fluido,
      pontoMedicao: execucaoCalibracoes.pontoMedicao,
      localCalibracao: execucaoCalibracoes.localCalibracao,
      diasParaAlertar: execucaoCalibracoes.diasParaAlertar,
      frequenciaCalibracaoMeses: execucaoCalibracoes.frequenciaCalibracaoMeses,
      numeroUltimoCertificado: execucaoCalibracoes.numeroUltimoCertificado,
      revisaoUltimoCertificado: execucaoCalibracoes.revisaoUltimoCertificado,
      dataUltimoCertificado: execucaoCalibracoes.dataUltimoCertificado,
      dataEmissaoUltimo: execucaoCalibracoes.dataEmissaoUltimo,
      statusUltimoCertificado: execucaoCalibracoes.statusUltimoCertificado,
      certificadoUltimoPath: execucaoCalibracoes.certificadoUltimoPath,
      laboratorioUltimo: execucaoCalibracoes.laboratorioUltimo,
      incertezaCalibracaoUltimo: execucaoCalibracoes.incertezaCalibracaoUltimo,
      erroMaximoAdmissivelCalibracaoUltimo: execucaoCalibracoes.erroMaximoAdmissivelCalibracaoUltimo,
      incertezaLimiteAnpUltimo: execucaoCalibracoes.incertezaLimiteAnpUltimo,
      erroMaximoAdmissivelAnpUltimo: execucaoCalibracoes.erroMaximoAdmissivelAnpUltimo,
      observacaoUltimo: execucaoCalibracoes.observacaoUltimo,
      meterFactorUltimo: execucaoCalibracoes.meterFactorUltimo,
      variacaoMfPercentUltimo: execucaoCalibracoes.variacaoMfPercentUltimo,
      kFactorUltimo: execucaoCalibracoes.kFactorUltimo,
      ajusteUltimo: execucaoCalibracoes.ajusteUltimo,
      erroMaximoAdmissivelUltimo: execucaoCalibracoes.erroMaximoAdmissivelUltimo,
      fatorCorrecaoTemperaturaUltimo: execucaoCalibracoes.fatorCorrecaoTemperaturaUltimo,
      fatorCorrecaoPressaoUltimo: execucaoCalibracoes.fatorCorrecaoPressaoUltimo,
      ajusteLinearidadeUltimo: execucaoCalibracoes.ajusteLinearidadeUltimo,
      repetibilidadeUltimo: execucaoCalibracoes.repetibilidadeUltimo,
      temperaturaCalibracao1Ultimo: execucaoCalibracoes.temperaturaCalibracao1Ultimo,
      temperaturaCalibracao2Ultimo: execucaoCalibracoes.temperaturaCalibracao2Ultimo,
      temperaturaCalibracao3Ultimo: execucaoCalibracoes.temperaturaCalibracao3Ultimo,
      pressaoCalibracao1Ultimo: execucaoCalibracoes.pressaoCalibracao1Ultimo,
      pressaoCalibracao2Ultimo: execucaoCalibracoes.pressaoCalibracao2Ultimo,
      pressaoCalibracao3Ultimo: execucaoCalibracoes.pressaoCalibracao3Ultimo,
      faixaMedicaoMinimaUltimo: execucaoCalibracoes.faixaMedicaoMinimaUltimo,
      faixaMedicaoMaximaUltimo: execucaoCalibracoes.faixaMedicaoMaximaUltimo,
      densidadeFluidoUltimo: execucaoCalibracoes.densidadeFluidoUltimo,
      createdAt: execucaoCalibracoes.createdAt,
      updatedAt: execucaoCalibracoes.updatedAt,
      tagEquipamento: equipamentos.tag,
      nomeEquipamento: equipamentos.nome,
      numeroSerieEquipamento: equipamentos.numeroSerie
    })
    .from(execucaoCalibracoes)
    .leftJoin(equipamentos, eq(execucaoCalibracoes.equipamentoId, equipamentos.id))
    .orderBy(desc(execucaoCalibracoes.createdAt));
    
    return result as ExecucaoCalibracaoWithEquipamento[];
  }

  async getExecucaoCalibracao(id: number): Promise<ExecucaoCalibracao | undefined> {
    const result = await db.select().from(execucaoCalibracoes).where(eq(execucaoCalibracoes.id, id));
    return result[0];
  }

  async createExecucaoCalibracao(execucao: InsertExecucaoCalibracao): Promise<ExecucaoCalibracao> {
    // Lógica de rotação de certificados: quando um novo certificado é inserido,
    // mover último -> penúltimo -> antepenúltimo
    const existing = await db.select().from(execucaoCalibracoes)
      .where(eq(execucaoCalibracoes.equipamentoId, (execucao as any).equipamentoId));
    
    if (existing.length > 0) {
      const current = existing[0];
      // Rotacionar certificados: último vira penúltimo, penúltimo vira antepenúltimo
      const updatedData = {
        ...(execucao as any),
        // Rotacionar certificados (comentado pois as propriedades não existem na tabela)
        // numeroPenultimoCertificado: current.numeroUltimoCertificado,
        // revisaoPenultimoCertificado: current.revisaoUltimoCertificado,
        // dataPenultimoCertificado: current.dataUltimoCertificado,
        // statusPenultimoCertificado: current.statusUltimoCertificado,
        // certificadoPenultimoPath: current.certificadoUltimoPath,
        
        // numeroAntepenultimoCertificado: current.numeroPenultimoCertificado,
        // revisaoAntepenultimoCertificado: current.revisaoPenultimoCertificado,
        // dataAntepenultimoCertificado: current.dataPenultimoCertificado,
        // statusAntepenultimoCertificado: current.statusPenultimoCertificado,
        // certificadoAntepenultimoPath: current.certificadoPenultimoPath,
      };
      
      const result = await db.update(execucaoCalibracoes)
        .set(updatedData as any)
        .where(eq(execucaoCalibracoes.equipamentoId, (execucao as any).equipamentoId))
        .returning();
      return result[0];
    } else {
      // Primeira execução para este equipamento
      const result = await db.insert(execucaoCalibracoes).values(execucao as any).returning();
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
    console.log('Starting getDashboardStats...');
    
    try {
      console.log('Fetching equipamentos count...');
      const [equipamentosCount] = await db.select({ count: count() }).from(equipamentos);
      console.log('Equipamentos count:', equipamentosCount.count);
      
      // Get equipment calibration data to calculate critical and expired
      console.log('Fetching equipment calibration data...');
      const equipamentosWithCalibration = await db
        .select({
          id: equipamentos.id,
          proximaCalibracao: planoCalibracoes.dataProximaCalibracão,
        })
        .from(equipamentos)
        .leftJoin(planoCalibracoes, eq(equipamentos.id, planoCalibracoes.equipamentoId));

      const hoje = new Date();
      let calibracoesVencidas = 0;
      let criticos = 0;
      let conformidade = 0;

      equipamentosWithCalibration.forEach(equip => {
        if (equip.proximaCalibracao) {
          const proximaData = new Date(equip.proximaCalibracao);
          const diasParaVencer = Math.ceil((proximaData.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diasParaVencer < 0) {
            calibracoesVencidas++;
          } else if (diasParaVencer <= 7) {
            criticos++;
          } else {
            conformidade++;
          }
        } else {
          // Equipment without calibration plan counts as expired
          calibracoesVencidas++;
        }
      });

      console.log('Calibration status:', { vencidas: calibracoesVencidas, criticos, conformidade });
      
      // Get distribution by polos with equipment counts
      console.log('Fetching polos distribution...');
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
      console.log('Polos distribution:', polosWithCounts.length, 'polos found');

      const result = {
        totalEquipamentos: equipamentosCount.count,
        calibracoesVencidas,
        criticos,
        conformidade,
        polosDistribution: polosWithCounts,
      };
      
      console.log('Dashboard stats result:', result);
      return result;
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
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
    const result = await db.insert(testesPocos).values(teste as any).returning();
    return result[0];
  }

  async getAllTestesPocos(filters?: { poloId?: number; instalacaoId?: number; pocoId?: number }) {
    let query = db.select().from(testesPocos);
    
    if (filters?.pocoId) {
      query = query.where(eq(testesPocos.pocoId, filters.pocoId)) as any;
    }
    // For polo and instalacao filters, we would need to join with other tables
    // For now, return all tests and let the frontend filter
    
    return await query.orderBy(desc(testesPocos.dataTeste));
  }

  async getTestePoco(id: number) {
    const result = await db.select().from(testesPocos)
      .where(eq(testesPocos.id, id))
      .limit(1);
    return result[0] || null;
  }

  async updateTestePoco(id: number, teste: any) {
    const result = await db.update(testesPocos)
      .set(teste as any)
      .where(eq(testesPocos.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteTestePoco(id: number) {
    const result = await db.delete(testesPocos)
      .where(eq(testesPocos.id, id))
      .returning();
    return result.length > 0;
  }

  // Incerteza Limites
  async getIncertezaLimites() {
    return await db.select().from(incertezaLimites)
      .where(eq(incertezaLimites.ativo, true))
      .orderBy(asc(incertezaLimites.fluido), asc(incertezaLimites.classificacao));
  }

  async createIncertezaLimite(limite: InsertIncertezaLimite) {
    const result = await db.insert(incertezaLimites).values(limite as any).returning();
    return result[0];
  }

  async getIncertezaLimite(id: number) {
    const [limite] = await db.select().from(incertezaLimites).where(eq(incertezaLimites.id, id));
    return limite;
  }

  async updateIncertezaLimite(id: number, limite: Partial<InsertIncertezaLimite>) {
    const result = await db
      .update(incertezaLimites)
      .set(limite as any)
      .where(eq(incertezaLimites.id, id))
      .returning();
    return result[0];
  }

  async deleteIncertezaLimite(id: number) {
    await db.delete(incertezaLimites).where(eq(incertezaLimites.id, id));
  }

  // Histórico de Calibrações
  async getHistoricoCalibracoes(equipamentoId?: number) {
    let query = db.select().from(historicoCalibracoes);

    if (equipamentoId) {
      query = query.where(eq(historicoCalibracoes.equipamentoId, equipamentoId)) as any;
    }

    return await query.orderBy(desc(historicoCalibracoes.dataCalibracão));
  }

  async getHistoricoCalibracao(id: number) {
    const [historico] = await db.select().from(historicoCalibracoes)
      .where(eq(historicoCalibracoes.id, id));
    return historico;
  }

  async createHistoricoCalibracao(historico: any) {
    const result = await db.insert(historicoCalibracoes).values(historico as any).returning();
    return result[0];
  }

  async updateHistoricoCalibracao(id: number, historico: any) {
    const result = await db
      .update(historicoCalibracoes)
      .set(historico as any)
      .where(eq(historicoCalibracoes.id, id))
      .returning();
    return result[0];
  }

  async deleteHistoricoCalibracao(id: number) {
    await db.delete(historicoCalibracoes).where(eq(historicoCalibracoes.id, id));
  }

  // Lacres Físicos
  async getLacresFisicos() {
    return await db.select().from(lacresFisicos).orderBy(desc(lacresFisicos.createdAt));
  }

  async getLacreFisico(id: number) {
    const [lacre] = await db.select().from(lacresFisicos).where(eq(lacresFisicos.id, id));
    return lacre;
  }

  async createLacreFisico(lacre: InsertLacreFisico) {
    const result = await db.insert(lacresFisicos).values(lacre as any).returning();
    return result[0];
  }

  async updateLacreFisico(id: number, lacre: Partial<InsertLacreFisico>) {
    const result = await db
      .update(lacresFisicos)
      .set(lacre as any)
      .where(eq(lacresFisicos.id, id))
      .returning();
    return result[0];
  }

  async deleteLacreFisico(id: number) {
    await db.delete(lacresFisicos).where(eq(lacresFisicos.id, id));
  }

  // Lacres Eletrônicos
  async getLacresEletronicos() {
    return await db.select().from(lacresEletronicos).orderBy(desc(lacresEletronicos.createdAt));
  }

  async getLacreEletronico(id: number) {
    const [lacre] = await db.select().from(lacresEletronicos).where(eq(lacresEletronicos.id, id));
    return lacre;
  }

  async createLacreEletronico(lacre: InsertLacreEletronico) {
    const result = await db.insert(lacresEletronicos).values(lacre as any).returning();
    return result[0];
  }

  async updateLacreEletronico(id: number, lacre: Partial<InsertLacreEletronico>) {
    const result = await db
      .update(lacresEletronicos)
      .set(lacre as any)
      .where(eq(lacresEletronicos.id, id))
      .returning();
    return result[0];
  }

  async deleteLacreEletronico(id: number) {
    await db.delete(lacresEletronicos).where(eq(lacresEletronicos.id, id));
  }

  // Controle de Lacres
  async getControleLacres() {
    return await db.select().from(controleLacres).orderBy(desc(controleLacres.createdAt));
  }

  async getControleLacre(id: number) {
    const [controle] = await db.select().from(controleLacres).where(eq(controleLacres.id, id));
    return controle;
  }

  async createControleLacre(controle: InsertControleLacre) {
    const result = await db.insert(controleLacres).values(controle as any).returning();
    return result[0];
  }

  async updateControleLacre(id: number, controle: Partial<InsertControleLacre>) {
    const result = await db
      .update(controleLacres)
      .set(controle as any)
      .where(eq(controleLacres.id, id))
      .returning();
    return result[0];
  }

  async deleteControleLacre(id: number) {
    await db.delete(controleLacres).where(eq(controleLacres.id, id));
  }

  // Calendar Events - Aggregate events from multiple sources
  async getCalendarEvents(filters?: { month?: number; year?: number }) {
    const events: any[] = [];
    
    try {
      // Build date filters if provided
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (filters?.month !== undefined && filters?.year !== undefined) {
        startDate = new Date(filters.year, filters.month - 1, 1);
        endDate = new Date(filters.year, filters.month, 0);
      }

      // 1. Equipment Calibrations (próxima calibração)
      const whereConditions = [sql`${calendarioCalibracoes.previsaoCalibracao} IS NOT NULL`];
      
      if (startDate && endDate) {
        whereConditions.push(
          gte(calendarioCalibracoes.previsaoCalibracao, startDate.toISOString().split('T')[0]),
          lte(calendarioCalibracoes.previsaoCalibracao, endDate.toISOString().split('T')[0])
        );
      }

      const calibrationEvents = await db
        .select({
          id: calendarioCalibracoes.equipamentoId,
          title: calendarioCalibracoes.equipamentoId,
          description: calendarioCalibracoes.observacao,
          date: calendarioCalibracoes.previsaoCalibracao,
          type: sql`'calibracao'`.as('type'),
          status: calendarioCalibracoes.status,
          priority: sql`CASE 
            WHEN ${calendarioCalibracoes.status} = 'vencido' THEN 'high'
            WHEN ${calendarioCalibracoes.status} = 'proximo' THEN 'medium' 
            ELSE 'low' 
          END`.as('priority')
        })
        .from(calendarioCalibracoes)
        .where(and(...whereConditions));
      events.push(...calibrationEvents);

      // 2. Well Tests (testes de poços)
      const wellTestConditions = [sql`${testesPocos.dataTeste} IS NOT NULL`];
      
      if (startDate && endDate) {
        wellTestConditions.push(
          gte(testesPocos.dataTeste, startDate.toISOString().split('T')[0]),
          lte(testesPocos.dataTeste, endDate.toISOString().split('T')[0])
        );
      }

      const wellTestEvents = await db
        .select({
          id: testesPocos.id,
          title: sql`'Teste BTP - ' || ${testesPocos.numeroBoletimTeste}`.as('title'),
          description: testesPocos.observacoes,
          date: testesPocos.dataTeste,
          type: sql`'teste_poco'`.as('type'),
          status: sql`'programada'`.as('status'),
          priority: sql`'medium'`.as('priority')
        })
        .from(testesPocos)
        .where(and(...wellTestConditions));
      events.push(...wellTestEvents);

      // 3. Chemical Analysis Collections (coletas de análises)
      const analysisConditions = [sql`${planoColetas.dataEmbarque} IS NOT NULL`];
      
      if (startDate && endDate) {
        analysisConditions.push(
          gte(planoColetas.dataEmbarque, startDate.toISOString().split('T')[0]),
          lte(planoColetas.dataEmbarque, endDate.toISOString().split('T')[0])
        );
      }

      const analysisEvents = await db
        .select({
          id: planoColetas.id,
          title: sql`'Coleta - ' || ${planoColetas.id}`.as('title'),
          description: planoColetas.observacoes,
          date: planoColetas.dataEmbarque,
          type: sql`'analise_quimica'`.as('type'),
          status: sql`'programada'`.as('status'),
          priority: sql`'low'`.as('priority')
        })
        .from(planoColetas)
        .where(and(...analysisConditions));
      events.push(...analysisEvents);

      // Calendar Calibrations já incluída acima

      // Sort events by date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return events;
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return [];
    }
  }

  // Unread Notifications Count
  async getUnreadNotificationsCount() {
    const [result] = await db
      .select({ count: count() })
      .from(sistemaNotificacoes)
      .where(eq(sistemaNotificacoes.status, 'ativa'));

    return result?.count || 0;
  }
}

export const storage = new Storage();