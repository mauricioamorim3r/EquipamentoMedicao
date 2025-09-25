import { eq, desc, asc, and, gte, lte, gt, sql, count } from "drizzle-orm";
import { db } from "./db";
import {
  users, polos, instalacoes, equipamentos, pontosMedicao, planoCalibracoes,
  historicoCalibracoes, cadastroPocos, testesPocos, placasOrificio, planoColetas,
  type User, type InsertUser, type Polo, type InsertPolo, type Instalacao, 
  type InsertInstalacao, type Equipamento, type InsertEquipamento,
  type PontoMedicao, type InsertPontoMedicao, type PlanoCalibracão, 
  type InsertPlanoCalibracão, type CadastroPoço, type InsertCadastroPoço,
  type PlacaOrificio, type InsertPlacaOrificio, type PlanoColeta, type InsertPlanoColeta
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
  createPontoMedicao(ponto: InsertPontoMedicao): Promise<PontoMedicao>;

  // Calibrações
  getPlanosCalibracoes(equipamentoId?: number): Promise<PlanoCalibracão[]>;
  getPlanoCalibracão(id: number): Promise<PlanoCalibracão | undefined>;
  createPlanoCalibracão(plano: InsertPlanoCalibracão): Promise<PlanoCalibracão>;
  updatePlanoCalibracão(id: number, plano: Partial<InsertPlanoCalibracão>): Promise<PlanoCalibracão>;
  getCalibrationStats(): Promise<{
    total: number;
    expired: number;
    critical: number;
    alert: number;
    ok: number;
  }>;

  // Poços
  getPocos(filters?: { poloId?: number; instalacaoId?: number }): Promise<CadastroPoço[]>;
  createPoço(poço: InsertCadastroPoço): Promise<CadastroPoço>;
  getTestesPocos(pocoId?: number): Promise<any[]>;

  // Placas de Orifício
  getPlacasOrificio(equipamentoId?: number): Promise<PlacaOrificio[]>;
  createPlacaOrificio(placa: InsertPlacaOrificio): Promise<PlacaOrificio>;

  // Análises Químicas
  getPlanosColetas(pontoMedicaoId?: number): Promise<PlanoColeta[]>;
  createPlanoColeta(plano: InsertPlanoColeta): Promise<PlanoColeta>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalEquipamentos: number;
    calibracoesVencidas: number;
    criticos: number;
    conformidade: number;
    polosDistribution: any[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPolos(): Promise<Polo[]> {
    return await db.select().from(polos).orderBy(asc(polos.nome));
  }

  async getPolo(id: number): Promise<Polo | undefined> {
    const [polo] = await db.select().from(polos).where(eq(polos.id, id));
    return polo || undefined;
  }

  async createPolo(polo: InsertPolo): Promise<Polo> {
    const [newPolo] = await db.insert(polos).values(polo).returning();
    return newPolo;
  }

  async updatePolo(id: number, polo: Partial<InsertPolo>): Promise<Polo> {
    const [updatedPolo] = await db.update(polos).set(polo).where(eq(polos.id, id)).returning();
    return updatedPolo;
  }

  async deletePolo(id: number): Promise<void> {
    await db.delete(polos).where(eq(polos.id, id));
  }

  async getInstalacoes(poloId?: number): Promise<Instalacao[]> {
    const query = db.select().from(instalacoes);
    if (poloId) {
      return await query.where(eq(instalacoes.poloId, poloId)).orderBy(asc(instalacoes.nome));
    }
    return await query.orderBy(asc(instalacoes.nome));
  }

  async getInstalacao(id: number): Promise<Instalacao | undefined> {
    const [instalacao] = await db.select().from(instalacoes).where(eq(instalacoes.id, id));
    return instalacao || undefined;
  }

  async createInstalacao(instalacao: InsertInstalacao): Promise<Instalacao> {
    const [newInstalacao] = await db.insert(instalacoes).values(instalacao).returning();
    return newInstalacao;
  }

  async updateInstalacao(id: number, instalacao: Partial<InsertInstalacao>): Promise<Instalacao> {
    const [updatedInstalacao] = await db.update(instalacoes).set(instalacao).where(eq(instalacoes.id, id)).returning();
    return updatedInstalacao;
  }

  async deleteInstalacao(id: number): Promise<void> {
    await db.delete(instalacoes).where(eq(instalacoes.id, id));
  }

  async getEquipamentos(filters?: { poloId?: number; instalacaoId?: number; status?: string }): Promise<Equipamento[]> {
    let query = db.select().from(equipamentos);
    
    const conditions = [];
    if (filters?.poloId) conditions.push(eq(equipamentos.poloId, filters.poloId));
    if (filters?.instalacaoId) conditions.push(eq(equipamentos.instalacaoId, filters.instalacaoId));
    if (filters?.status) conditions.push(eq(equipamentos.status, filters.status));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(asc(equipamentos.tag));
  }

  async getEquipamento(id: number): Promise<Equipamento | undefined> {
    const [equipamento] = await db.select().from(equipamentos).where(eq(equipamentos.id, id));
    return equipamento || undefined;
  }

  async createEquipamento(equipamento: InsertEquipamento): Promise<Equipamento> {
    const [newEquipamento] = await db.insert(equipamentos).values(equipamento).returning();
    return newEquipamento;
  }

  async updateEquipamento(id: number, equipamento: Partial<InsertEquipamento>): Promise<Equipamento> {
    const [updatedEquipamento] = await db.update(equipamentos).set(equipamento).where(eq(equipamentos.id, id)).returning();
    return updatedEquipamento;
  }

  async deleteEquipamento(id: number): Promise<void> {
    await db.delete(equipamentos).where(eq(equipamentos.id, id));
  }

  async getEquipamentosWithCalibrationStatus(): Promise<any[]> {
    return await db.select({
      id: equipamentos.id,
      tag: equipamentos.tag,
      nome: equipamentos.nome,
      fabricante: equipamentos.fabricante,
      modelo: equipamentos.modelo,
      status: equipamentos.status,
      poloId: equipamentos.poloId,
      instalacaoId: equipamentos.instalacaoId,
      dataProximaCalibracão: planoCalibracoes.dataProximaCalibracão,
      diasParaVencer: planoCalibracoes.diasParaVencer,
      statusCalibracao: planoCalibracoes.statusCalibracao,
      certificado: planoCalibracoes.certificadoCalibracão,
    })
    .from(equipamentos)
    .leftJoin(planoCalibracoes, eq(equipamentos.id, planoCalibracoes.equipamentoId))
    .orderBy(asc(equipamentos.tag));
  }

  async getPontosMedicao(equipamentoId?: number): Promise<PontoMedicao[]> {
    const query = db.select().from(pontosMedicao);
    if (equipamentoId) {
      return await query.where(eq(pontosMedicao.equipamentoId, equipamentoId));
    }
    return await query.orderBy(asc(pontosMedicao.tag));
  }

  async createPontoMedicao(ponto: InsertPontoMedicao): Promise<PontoMedicao> {
    const [newPonto] = await db.insert(pontosMedicao).values(ponto).returning();
    return newPonto;
  }

  async getPlanosCalibracoes(equipamentoId?: number): Promise<PlanoCalibracão[]> {
    const query = db.select().from(planoCalibracoes);
    if (equipamentoId) {
      return await query.where(eq(planoCalibracoes.equipamentoId, equipamentoId));
    }
    return await query.orderBy(desc(planoCalibracoes.dataProximaCalibracão));
  }

  async getPlanoCalibracão(id: number): Promise<PlanoCalibracão | undefined> {
    const [plano] = await db.select().from(planoCalibracoes).where(eq(planoCalibracoes.id, id));
    return plano || undefined;
  }

  async createPlanoCalibracão(plano: InsertPlanoCalibracão): Promise<PlanoCalibracão> {
    const [newPlano] = await db.insert(planoCalibracoes).values(plano).returning();
    return newPlano;
  }

  async updatePlanoCalibracão(id: number, plano: Partial<InsertPlanoCalibracão>): Promise<PlanoCalibracão> {
    const [updatedPlano] = await db.update(planoCalibracoes).set(plano).where(eq(planoCalibracoes.id, id)).returning();
    return updatedPlano;
  }

  async getCalibrationStats(): Promise<{
    total: number;
    expired: number;
    critical: number;
    alert: number;
    proximo: number;
    ok: number;
  }> {
    const today = new Date();
    const [totalResult] = await db.select({ count: count() }).from(equipamentos);
    const [expiredResult] = await db.select({ count: count() }).from(planoCalibracoes).where(lte(planoCalibracoes.diasParaVencer, 0));
    const [criticalResult] = await db.select({ count: count() }).from(planoCalibracoes).where(and(gte(planoCalibracoes.diasParaVencer, 1), lte(planoCalibracoes.diasParaVencer, 7)));
    const [alertResult] = await db.select({ count: count() }).from(planoCalibracoes).where(and(gte(planoCalibracoes.diasParaVencer, 8), lte(planoCalibracoes.diasParaVencer, 30)));
    const [proximoResult] = await db.select({ count: count() }).from(planoCalibracoes).where(and(gte(planoCalibracoes.diasParaVencer, 31), lte(planoCalibracoes.diasParaVencer, 90)));
    const [okResult] = await db.select({ count: count() }).from(planoCalibracoes).where(gt(planoCalibracoes.diasParaVencer, 90));

    return {
      total: totalResult.count,
      expired: expiredResult.count,
      critical: criticalResult.count,
      alert: alertResult.count,
      proximo: proximoResult.count,
      ok: okResult.count,
    };
  }

  async getPocos(filters?: { poloId?: number; instalacaoId?: number }): Promise<CadastroPoço[]> {
    let query = db.select().from(cadastroPocos);
    
    const conditions = [];
    if (filters?.poloId) conditions.push(eq(cadastroPocos.poloId, filters.poloId));
    if (filters?.instalacaoId) conditions.push(eq(cadastroPocos.instalacaoId, filters.instalacaoId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(asc(cadastroPocos.codigo));
  }

  async createPoço(poço: InsertCadastroPoço): Promise<CadastroPoço> {
    const [newPoço] = await db.insert(cadastroPocos).values(poço).returning();
    return newPoço;
  }

  async getTestesPocos(pocoId?: number): Promise<any[]> {
    const query = db.select().from(testesPocos);
    if (pocoId) {
      return await query.where(eq(testesPocos.pocoId, pocoId));
    }
    return await query.orderBy(desc(testesPocos.dataTeste));
  }

  async getPlacasOrificio(equipamentoId?: number): Promise<PlacaOrificio[]> {
    const query = db.select().from(placasOrificio);
    if (equipamentoId) {
      return await query.where(eq(placasOrificio.equipamentoId, equipamentoId));
    }
    return await query.orderBy(desc(placasOrificio.dataInstalacao));
  }

  async createPlacaOrificio(placa: InsertPlacaOrificio): Promise<PlacaOrificio> {
    const [newPlaca] = await db.insert(placasOrificio).values(placa).returning();
    return newPlaca;
  }

  async getPlanosColetas(pontoMedicaoId?: number): Promise<PlanoColeta[]> {
    const query = db.select().from(planoColetas);
    if (pontoMedicaoId) {
      return await query.where(eq(planoColetas.pontoMedicaoId, pontoMedicaoId));
    }
    return await query.orderBy(desc(planoColetas.dataEmbarque));
  }

  async createPlanoColeta(plano: InsertPlanoColeta): Promise<PlanoColeta> {
    const [newPlano] = await db.insert(planoColetas).values(plano).returning();
    return newPlano;
  }

  async getDashboardStats(): Promise<{
    totalEquipamentos: number;
    calibracoesVencidas: number;
    criticos: number;
    conformidade: number;
    polosDistribution: any[];
  }> {
    const [totalEquip] = await db.select({ count: count() }).from(equipamentos);
    const [vencidas] = await db.select({ count: count() }).from(planoCalibracoes).where(lte(planoCalibracoes.diasParaVencer, 0));
    const [criticos] = await db.select({ count: count() }).from(planoCalibracoes).where(and(gte(planoCalibracoes.diasParaVencer, 1), lte(planoCalibracoes.diasParaVencer, 7)));
    
    const polosData = await db.select({
      id: polos.id,
      nome: polos.nome,
      sigla: polos.sigla,
      equipCount: count(equipamentos.id),
    })
    .from(polos)
    .leftJoin(equipamentos, eq(polos.id, equipamentos.poloId))
    .groupBy(polos.id, polos.nome, polos.sigla)
    .orderBy(desc(count(equipamentos.id)));

    const totalEquipamentos = totalEquip.count;
    const conformes = totalEquipamentos - vencidas.count - criticos.count;
    const conformidade = totalEquipamentos > 0 ? (conformes / totalEquipamentos) * 100 : 0;

    return {
      totalEquipamentos,
      calibracoesVencidas: vencidas.count,
      criticos: criticos.count,
      conformidade: Math.round(conformidade * 10) / 10,
      polosDistribution: polosData,
    };
  }
}

export const storage = new DatabaseStorage();
