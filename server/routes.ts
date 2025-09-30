import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { upload } from "./upload";
import {
  exportToExcel,
  exportEquipmentReport,
  exportCalibrationReport,
  exportWellsReport,
  exportDashboardStats,
} from "./exportUtils";
import { TEMPLATES, generateTemplate, parseImportedFile } from "./templateUtils";
import {
  insertPoloSchema, insertInstalacaoSchema, insertEquipamentoSchema,
  insertPontoMedicaoSchema, insertPlanoCalibracaoSchema, insertCadastroPocoSchema,
  insertTestePocoSchema, insertPlacaOrificioSchema, insertPlanoColetaSchema, insertAnaliseQuimicaSchema,
  insertValvulaSchema, insertControleIncertezaSchema, insertIncertezaLimiteSchema, insertSistemaNotificacaoSchema,
  insertCampoSchema, insertCalendarioCalibracaoSchema, insertHistoricoCalibracaoSchema,
  insertTrechoRetoSchema, insertMedidorPrimarioSchema, insertGestaoCilindroSchema, insertAnaliseFqGenericaSchema,
  insertAnaliseCromatografiaSchema, insertAnalisePvtSchema, insertCertificadoCalibracaoSchema, insertExecucaoCalibracaoSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Polos routes
  app.get("/api/polos", async (req, res) => {
    try {
      const polos = await storage.getPolos();
      res.json(polos);
    } catch (error) {
      console.error("Error fetching polos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/polos", async (req, res) => {
    try {
      const data = insertPoloSchema.parse(req.body);
      const polo = await storage.createPolo(data);
      res.status(201).json(polo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating polo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Campos routes
  app.get("/api/campos", async (req, res) => {
    try {
      const poloId = req.query.poloId ? parseInt(req.query.poloId as string) : undefined;
      const campos = await storage.getCampos(poloId);
      res.json(campos);
    } catch (error) {
      console.error("Error fetching campos:", error);
      res.status(500).json({ error: "Failed to fetch campos" });
    }
  });

  app.post("/api/campos", async (req, res) => {
    try {
      const data = insertCampoSchema.parse(req.body);
      const campo = await storage.createCampo(data);
      res.status(201).json(campo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating campo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/campos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCampoSchema.parse(req.body);
      const campo = await storage.updateCampo(id, data);
      res.json(campo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating campo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/campos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campo = await storage.getCampo(id);
      if (!campo) {
        return res.status(404).json({ error: "Campo not found" });
      }
      res.json(campo);
    } catch (error) {
      console.error("Error fetching campo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/campos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCampo(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting campo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Instalações routes
  app.get("/api/instalacoes", async (req, res) => {
    try {
      const poloId = req.query.poloId ? parseInt(req.query.poloId as string) : undefined;
      const instalacoes = await storage.getInstalacoes(poloId);
      res.json(instalacoes);
    } catch (error) {
      console.error("Error fetching instalacoes:", error);
      res.status(500).json({ error: "Failed to fetch instalacoes" });
    }
  });

  app.get("/api/instalacoes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const instalacao = await storage.getInstalacao(id);
      if (!instalacao) {
        return res.status(404).json({ error: "Instalacao not found" });
      }
      res.json(instalacao);
    } catch (error) {
      console.error("Error fetching instalacao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/instalacoes", async (req, res) => {
    try {
      const data = insertInstalacaoSchema.parse(req.body);
      const instalacao = await storage.createInstalacao(data);
      res.status(201).json(instalacao);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating instalacao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Equipamentos routes
  app.get("/api/equipamentos", async (req, res) => {
    try {
      const filters = {
        poloId: req.query.poloId ? parseInt(req.query.poloId as string) : undefined,
        instalacaoId: req.query.instalacaoId ? parseInt(req.query.instalacaoId as string) : undefined,
        status: req.query.status as string | undefined,
      };
      const equipamentos = await storage.getEquipamentos(filters);
      res.json(equipamentos);
    } catch (error) {
      console.error("Error fetching equipamentos:", error);
      res.status(500).json({ error: "Failed to fetch equipamentos" });
    }
  });

  app.get("/api/equipamentos/with-calibration", async (req, res) => {
    try {
      const equipamentos = await storage.getEquipamentosWithCalibrationStatus();
      res.json(equipamentos);
    } catch (error) {
      console.error("Error fetching equipamentos with calibration:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/equipamentos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipamento = await storage.getEquipamento(id);
      if (!equipamento) {
        return res.status(404).json({ error: "Equipamento not found" });
      }
      res.json(equipamento);
    } catch (error) {
      console.error("Error fetching equipamento:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/equipamentos", async (req, res) => {
    try {
      const data = insertEquipamentoSchema.parse(req.body);
      const equipamento = await storage.createEquipamento(data);
      res.status(201).json(equipamento);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating equipamento:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/equipamentos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEquipamentoSchema.partial().parse(req.body);
      const equipamento = await storage.updateEquipamento(id, data);
      res.json(equipamento);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating equipamento:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/equipamentos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEquipamento(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting equipamento:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Calibrações routes
  app.get("/api/calibracoes", async (req, res) => {
    try {
      const equipamentoId = req.query.equipamentoId ? parseInt(req.query.equipamentoId as string) : undefined;
      const calibracoes = await storage.getPlanoCalibracoes(equipamentoId);
      res.json(calibracoes);
    } catch (error) {
      console.error("Error fetching calibracoes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/calibracoes", async (req, res) => {
    try {
      const data = insertPlanoCalibracaoSchema.parse(req.body);
      const calibracao = await storage.createPlanoCalibracão(data);
      res.status(201).json(calibracao);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating calibracao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/calibracoes/stats", async (req, res) => {
    try {
      const stats = await storage.getCalibrationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching calibration stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Poços routes
  app.get("/api/pocos", async (req, res) => {
    try {
      const filters = {
        poloId: req.query.poloId ? parseInt(req.query.poloId as string) : undefined,
        instalacaoId: req.query.instalacaoId ? parseInt(req.query.instalacaoId as string) : undefined,
      };
      const pocos = await storage.getPocos(filters);
      res.json(pocos);
    } catch (error) {
      console.error("Error fetching pocos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/pocos", async (req, res) => {
    try {
      const data = insertCadastroPocoSchema.parse(req.body);
      const poco = await storage.createPoco(data);
      res.status(201).json(poco);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating poco:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Testes de Poços routes
  app.get("/api/pocos/:id/testes", async (req, res) => {
    try {
      const pocoId = parseInt(req.params.id);
      const testes = await storage.getTestesPocos(pocoId);
      res.json(testes);
    } catch (error) {
      console.error("Error fetching well tests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/pocos/:id/testes", async (req, res) => {
    try {
      const pocoId = parseInt(req.params.id);
      const data = insertTestePocoSchema.parse({ ...req.body, pocoId });
      const teste = await storage.createTestePoco(data);
      res.status(201).json(teste);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating well test:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Placas de Orifício routes
  app.get("/api/placas-orificio", async (req, res) => {
    try {
      const equipamentoId = req.query.equipamentoId ? parseInt(req.query.equipamentoId as string) : undefined;
      const placas = await storage.getPlacasOrificio({ equipamentoId });
      res.json(placas);
    } catch (error) {
      console.error("Error fetching placas orificio:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/placas-orificio", async (req, res) => {
    try {
      const data = insertPlacaOrificioSchema.parse(req.body);
      const placa = await storage.createPlacaOrificio(data);
      res.status(201).json(placa);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating placa orificio:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/placas-orificio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertPlacaOrificioSchema.parse(req.body);
      const placa = await storage.updatePlacaOrificio(id, data);
      res.json(placa);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating placa orificio:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/placas-orificio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePlacaOrificio(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting placa orificio:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Pontos de Medição routes
  app.get("/api/pontos-medicao", async (req, res) => {
    try {
      const equipamentoId = req.query.equipamentoId ? parseInt(req.query.equipamentoId as string) : undefined;
      const pontos = await storage.getPontosMedicao(equipamentoId);
      res.json(pontos);
    } catch (error) {
      console.error("Error fetching pontos medicao:", error);
      res.status(500).json({ error: "Failed to fetch pontos medicao" });
    }
  });

  app.post("/api/pontos-medicao", async (req, res) => {
    try {
      const data = insertPontoMedicaoSchema.parse(req.body);
      const ponto = await storage.createPontoMedicao(data);
      res.status(201).json(ponto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating ponto medicao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Planos de Coleta routes
  app.get("/api/planos-coleta", async (req, res) => {
    try {
      const pontoMedicaoId = req.query.pontoMedicaoId ? parseInt(req.query.pontoMedicaoId as string) : undefined;
      const planos = await storage.getPlanoColetas(pontoMedicaoId);
      res.json(planos);
    } catch (error) {
      console.error("Error fetching planos coleta:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/planos-coleta", async (req, res) => {
    try {
      const data = insertPlanoColetaSchema.parse(req.body);
      
      // Validate that measurement point exists
      if (!data.pontoMedicaoId || data.pontoMedicaoId === 0) {
        return res.status(400).json({ 
          error: "Ponto de medição é obrigatório" 
        });
      }

      // Check if measurement point exists
      const pontoExists = await storage.getPontosMedicao();
      const validPonto = pontoExists.find(p => p.id === data.pontoMedicaoId);
      if (!validPonto) {
        return res.status(400).json({ 
          error: "Ponto de medição selecionado não existe" 
        });
      }

      const plano = await storage.createPlanoColeta(data);
      res.status(201).json(plano);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating plano coleta:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/planos-coleta/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertPlanoColetaSchema.partial().parse(req.body);
      const plano = await storage.updatePlanoColeta(id, data);
      res.json(plano);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating plano coleta:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/planos-coleta/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePlanoColeta(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting plano coleta:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Análises Químicas routes
  app.get("/api/analises-quimicas", async (req, res) => {
    try {
      const planoColetaId = req.query.planoColetaId ? parseInt(req.query.planoColetaId as string) : undefined;
      const analises = await storage.getAnalisesQuimicas(planoColetaId);
      res.json(analises);
    } catch (error) {
      console.error("Error fetching analises quimicas:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/analises-quimicas", async (req, res) => {
    try {
      const data = insertAnaliseQuimicaSchema.parse(req.body);
      const analise = await storage.createAnaliseQuimica(data);
      res.status(201).json(analise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating analise quimica:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/analises-quimicas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertAnaliseQuimicaSchema.partial().parse(req.body);
      const analise = await storage.updateAnaliseQuimica(id, data);
      res.json(analise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating analise quimica:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/analises-quimicas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnaliseQuimica(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting analise quimica:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Válvulas routes
  app.get("/api/valvulas", async (req, res) => {
    try {
      const equipamentoId = req.query.equipamentoId ? parseInt(req.query.equipamentoId as string) : undefined;
      const valvulas = await storage.getValvulas(equipamentoId);
      res.json(valvulas);
    } catch (error) {
      console.error("Error fetching valvulas:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/valvulas", async (req, res) => {
    try {
      const data = insertValvulaSchema.parse(req.body);
      const valvula = await storage.createValvula(data);
      res.status(201).json(valvula);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating valvula:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/valvulas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertValvulaSchema.partial().parse(req.body);
      const valvula = await storage.updateValvula(id, data);
      res.json(valvula);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating valvula:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/valvulas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteValvula(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting valvula:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Controle de Incertezas routes
  app.get("/api/controle-incertezas", async (req, res) => {
    try {
      const equipamentoId = req.query.equipamentoId ? parseInt(req.query.equipamentoId as string) : undefined;
      const incertezas = await storage.getControleIncertezas(equipamentoId);
      res.json(incertezas);
    } catch (error) {
      console.error("Error fetching controle incertezas:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/controle-incertezas", async (req, res) => {
    try {
      const data = insertControleIncertezaSchema.parse(req.body);
      const incerteza = await storage.createControleIncerteza(data);
      res.status(201).json(incerteza);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating controle incerteza:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/controle-incertezas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertControleIncertezaSchema.partial().parse(req.body);
      const incerteza = await storage.updateControleIncerteza(id, data);
      res.json(incerteza);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating controle incerteza:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/controle-incertezas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteControleIncerteza(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting controle incerteza:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Limites de Incerteza routes
  app.get("/api/incerteza-limites", async (req, res) => {
    try {
      const limites = await storage.getIncertezaLimites();
      res.json(limites);
    } catch (error) {
      console.error("Error fetching incerteza limites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/incerteza-limites", async (req, res) => {
    try {
      const data = insertIncertezaLimiteSchema.parse(req.body);
      const limite = await storage.createIncertezaLimite(data);
      res.status(201).json(limite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating incerteza limite:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sistema de Notificações routes
  app.get("/api/notificacoes", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        categoria: req.query.categoria as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
      const notificacoes = await storage.getNotificacoes();
      res.json(notificacoes);
    } catch (error) {
      console.error("Error fetching notificacoes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/notificacoes", async (req, res) => {
    try {
      const data = insertSistemaNotificacaoSchema.parse(req.body);
      const notificacao = await storage.createNotificacao(data);
      res.status(201).json(notificacao);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating notificacao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/notificacoes/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificacaoAsRead(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/notificacoes/unread-count", async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Calendário de Calibrações routes
  app.get("/api/calendario-calibracoes", async (req, res) => {
    try {
      const filters = {
        poloId: req.query.poloId ? parseInt(req.query.poloId as string) : undefined,
        instalacaoId: req.query.instalacaoId ? parseInt(req.query.instalacaoId as string) : undefined,
        mes: req.query.mes ? parseInt(req.query.mes as string) : undefined,
        ano: req.query.ano ? parseInt(req.query.ano as string) : undefined,
      };
      const calendarios = await storage.getCalendarioCalibracoes(filters);
      res.json(calendarios);
    } catch (error) {
      console.error("Error fetching calendario calibracoes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/calendario-calibracoes", async (req, res) => {
    try {
      const data = insertCalendarioCalibracaoSchema.parse(req.body);
      const calendario = await storage.createCalendarioCalibracao(data);
      res.status(201).json(calendario);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating calendario calibracao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/calendario-calibracoes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCalendarioCalibracaoSchema.parse(req.body);
      const calendario = await storage.updateCalendarioCalibracao(id, data);
      res.json(calendario);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating calendario calibracao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Trechos Retos routes
  app.get("/api/trechos-retos", async (req, res) => {
    try {
      const filters = {
        campoId: req.query.campoId ? parseInt(req.query.campoId as string) : undefined,
        instalacaoId: req.query.instalacaoId ? parseInt(req.query.instalacaoId as string) : undefined,
      };
      const trechos = await storage.getTrechosRetos(filters);
      res.json(trechos);
    } catch (error) {
      console.error("Error fetching trechos retos:", error);
      res.status(500).json({ error: "Failed to fetch trechos retos" });
    }
  });

  app.post("/api/trechos-retos", async (req, res) => {
    try {
      const data = insertTrechoRetoSchema.parse(req.body);
      const trecho = await storage.createTrechoReto(data);
      res.status(201).json(trecho);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating trecho reto:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/trechos-retos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertTrechoRetoSchema.parse(req.body);
      const trecho = await storage.updateTrechoReto(id, data);
      res.json(trecho);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating trecho reto:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/trechos-retos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTrechoReto(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting trecho reto:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Medidores Primários routes
  app.get("/api/medidores-primarios", async (req, res) => {
    try {
      const filters = {
        campoId: req.query.campoId ? parseInt(req.query.campoId as string) : undefined,
        instalacaoId: req.query.instalacaoId ? parseInt(req.query.instalacaoId as string) : undefined,
        tipoMedidor: req.query.tipoMedidor as string | undefined,
      };
      const medidores = await storage.getMedidoresPrimarios(filters);
      res.json(medidores);
    } catch (error) {
      console.error("Error fetching medidores primarios:", error);
      res.status(500).json({ error: "Failed to fetch medidores primarios" });
    }
  });

  app.post("/api/medidores-primarios", async (req, res) => {
    try {
      const data = insertMedidorPrimarioSchema.parse(req.body);
      const medidor = await storage.createMedidorPrimario(data);
      res.status(201).json(medidor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating medidor primario:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/medidores-primarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertMedidorPrimarioSchema.partial().parse(req.body);
      const medidor = await storage.updateMedidorPrimario(id, data);
      res.json(medidor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating medidor primario:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/medidores-primarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMedidorPrimario(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting medidor primario:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Gestão de Cilindros routes
  app.get("/api/gestao-cilindros", async (req, res) => {
    try {
      const poloId = req.query.poloId ? parseInt(req.query.poloId as string) : undefined;
      const cilindros = await storage.getGestaoCilindros(poloId);
      res.json(cilindros);
    } catch (error) {
      console.error("Error fetching gestao cilindros:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/gestao-cilindros", async (req, res) => {
    try {
      const data = insertGestaoCilindroSchema.parse(req.body);
      const cilindro = await storage.createGestaoCilindro(data);
      res.status(201).json(cilindro);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating gestao cilindro:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/gestao-cilindros/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertGestaoCilindroSchema.parse(req.body);
      const cilindro = await storage.updateGestaoCilindro(id, data);
      res.json(cilindro);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating gestao cilindro:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Análises FQ Genérica routes
  app.get("/api/analises-fq-generica", async (req, res) => {
    try {
      const filters = {
        poloId: req.query.poloId ? parseInt(req.query.poloId as string) : undefined,
        instalacaoId: req.query.instalacaoId ? parseInt(req.query.instalacaoId as string) : undefined,
      };
      const analises = await storage.getAnalisesFqGenerica(filters);
      res.json(analises);
    } catch (error) {
      console.error("Error fetching analises fq generica:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/analises-fq-generica", async (req, res) => {
    try {
      const data = insertAnaliseFqGenericaSchema.parse(req.body);
      const analise = await storage.createAnaliseFqGenerica(data);
      res.status(201).json(analise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating analise fq generica:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Análises Cromatografia routes
  app.get("/api/analises-cromatografia", async (req, res) => {
    try {
      const filters = {
        poloId: req.query.poloId ? parseInt(req.query.poloId as string) : undefined,
        instalacaoId: req.query.instalacaoId ? parseInt(req.query.instalacaoId as string) : undefined,
      };
      const analises = await storage.getAnalisesCromatografia(filters);
      res.json(analises);
    } catch (error) {
      console.error("Error fetching analises cromatografia:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/analises-cromatografia", async (req, res) => {
    try {
      const data = insertAnaliseCromatografiaSchema.parse(req.body);
      const analise = await storage.createAnaliseCromatografia(data);
      res.status(201).json(analise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating analise cromatografia:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Análises PVT routes
  app.get("/api/analises-pvt", async (req, res) => {
    try {
      const filters = {
        poloId: req.query.poloId ? parseInt(req.query.poloId as string) : undefined,
        pocoId: req.query.pocoId ? parseInt(req.query.pocoId as string) : undefined,
      };
      const analises = await storage.getAnalisesPvt(filters);
      res.json(analises);
    } catch (error) {
      console.error("Error fetching analises pvt:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/analises-pvt", async (req, res) => {
    try {
      const data = insertAnalisePvtSchema.parse(req.body);
      const analise = await storage.createAnalisePvt(data);
      res.status(201).json(analise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating analise pvt:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Certificados de Calibração routes
  app.get("/api/certificados-calibracao", async (req, res) => {
    try {
      const certificados = await storage.getCertificadosCalibração();
      res.json(certificados);
    } catch (error) {
      console.error("Error fetching certificados:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/certificados-calibracao", async (req, res) => {
    try {
      const data = insertCertificadoCalibracaoSchema.parse(req.body);
      const certificado = await storage.createCertificadoCalibracao(data);
      res.status(201).json(certificado);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating certificado:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/certificados-calibracao/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCertificadoCalibracaoSchema.parse(req.body);
      const certificado = await storage.updateCertificadoCalibracao(id, data);
      res.json(certificado);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating certificado:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Execução de Calibrações routes
  app.get("/api/execucao-calibracoes", async (req, res) => {
    try {
      const execucoes = await storage.getExecucaoCalibracoes();
      res.json(execucoes);
    } catch (error) {
      console.error("Error fetching execucoes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/execucao-calibracoes", async (req, res) => {
    try {
      const data = insertExecucaoCalibracaoSchema.parse(req.body);
      const execucao = await storage.createExecucaoCalibracao(data);
      res.status(201).json(execucao);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating execucao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/execucao-calibracoes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertExecucaoCalibracaoSchema.parse(req.body);
      const execucao = await storage.updateExecucaoCalibracao(id, data);
      res.json(execucao);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating execucao:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Upload routes
  app.post("/api/upload/certificado", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      res.json({
        success: true,
        filename: req.file.filename,
        path: `/uploads/certificates/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error: any) {
      console.error("Error uploading certificate:", error);
      res.status(500).json({ error: error.message || "Erro ao fazer upload" });
    }
  });

  app.post("/api/upload/btp", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      res.json({
        success: true,
        filename: req.file.filename,
        path: `/uploads/btp/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error: any) {
      console.error("Error uploading BTP:", error);
      res.status(500).json({ error: error.message || "Erro ao fazer upload" });
    }
  });

  // Export routes
  app.get("/api/export/equipamentos", async (req, res) => {
    try {
      const format = req.query.format as string || "excel";
      const equipamentos = await storage.getEquipamentosWithCalibrationStatus();

      if (format === "pdf") {
        const pdfBuffer = exportEquipmentReport(equipamentos);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=equipamentos.pdf");
        res.send(pdfBuffer);
      } else {
        const excelBuffer = exportToExcel(equipamentos, "equipamentos.xlsx", "Equipamentos");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=equipamentos.xlsx");
        res.send(excelBuffer);
      }
    } catch (error) {
      console.error("Error exporting equipamentos:", error);
      res.status(500).json({ error: "Erro ao exportar equipamentos" });
    }
  });

  app.get("/api/export/calibracoes", async (req, res) => {
    try {
      const format = req.query.format as string || "excel";
      const equipamentos = await storage.getEquipamentosWithCalibrationStatus();

      if (format === "pdf") {
        const pdfBuffer = exportCalibrationReport(equipamentos);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=calibracoes.pdf");
        res.send(pdfBuffer);
      } else {
        const excelBuffer = exportToExcel(equipamentos, "calibracoes.xlsx", "Calibrações");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=calibracoes.xlsx");
        res.send(excelBuffer);
      }
    } catch (error) {
      console.error("Error exporting calibracoes:", error);
      res.status(500).json({ error: "Erro ao exportar calibrações" });
    }
  });

  app.get("/api/export/pocos", async (req, res) => {
    try {
      const format = req.query.format as string || "excel";
      const pocos = await storage.getPocos();

      if (format === "pdf") {
        const pdfBuffer = exportWellsReport(pocos);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=pocos.pdf");
        res.send(pdfBuffer);
      } else {
        const excelBuffer = exportToExcel(pocos, "pocos.xlsx", "Poços");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=pocos.xlsx");
        res.send(excelBuffer);
      }
    } catch (error) {
      console.error("Error exporting pocos:", error);
      res.status(500).json({ error: "Erro ao exportar poços" });
    }
  });

  app.get("/api/export/dashboard", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const excelBuffer = exportDashboardStats(stats);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=dashboard-stats.xlsx");
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting dashboard stats:", error);
      res.status(500).json({ error: "Erro ao exportar estatísticas" });
    }
  });

  // ==================== TEMPLATE ROUTES ====================

  // Get list of available templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templateList = Object.keys(TEMPLATES).map(key => ({
        id: key,
        name: TEMPLATES[key as keyof typeof TEMPLATES].name,
        description: `Template para importação de ${TEMPLATES[key as keyof typeof TEMPLATES].name}`
      }));

      res.json(templateList);
    } catch (error) {
      console.error("Error listing templates:", error);
      res.status(500).json({ error: "Erro ao listar templates" });
    }
  });

  // Download specific template
  app.get("/api/templates/:type", async (req, res) => {
    try {
      const templateType = req.params.type as keyof typeof TEMPLATES;
      const template = TEMPLATES[templateType];

      if (!template) {
        return res.status(404).json({ error: "Template não encontrado" });
      }

      const excelBuffer = generateTemplate(template);
      const filename = `template_${templateType}.xlsx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ error: "Erro ao gerar template" });
    }
  });

  // Import data from Excel
  app.post("/api/import/:type", upload.single("file"), async (req, res) => {
    try {
      const templateType = req.params.type as keyof typeof TEMPLATES;
      const template = TEMPLATES[templateType];

      if (!template) {
        return res.status(404).json({ error: "Template não encontrado" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      // Parse Excel file
      const parseResult = parseImportedFile(req.file.buffer, template);

      // If validation mode, return results without saving
      if (req.query.validate === "true") {
        return res.json({
          success: true,
          message: "Validação concluída",
          ...parseResult
        });
      }

      // Insert valid data
      const results = {
        inserted: 0,
        failed: 0,
        errors: [] as any[]
      };

      for (const item of parseResult.data) {
        if (item.isValid) {
          try {
            // Insert based on type
            switch (templateType) {
              case "equipamentos":
                await storage.createEquipamento(item.data);
                results.inserted++;
                break;
              case "pocos":
                await storage.createPoco(item.data);
                results.inserted++;
                break;
              case "placas_orificio":
                await storage.createPlacaOrificio(item.data);
                results.inserted++;
                break;
              case "valvulas":
                await storage.createValvula(item.data);
                results.inserted++;
                break;
              case "campos":
                await storage.createCampo(item.data);
                results.inserted++;
                break;
              case "trechos_retos":
                await storage.createTrechoReto(item.data);
                results.inserted++;
                break;
              case "analises_quimicas":
                await storage.createAnaliseQuimica(item.data);
                results.inserted++;
                break;
              case "controle_incertezas":
                await storage.createControleIncerteza(item.data);
                results.inserted++;
                break;
              case "instalacoes":
                await storage.createInstalacao(item.data);
                results.inserted++;
                break;
              case "pontos_medicao":
                await storage.createPontoMedicao(item.data);
                results.inserted++;
                break;
              case "plano_calibracoes":
                await storage.createPlanoCalibracão(item.data);
                results.inserted++;
                break;
              default:
                results.failed++;
                results.errors.push({
                  row: item.row,
                  error: "Tipo de importação não suportado"
                });
            }
          } catch (error: any) {
            results.failed++;
            results.errors.push({
              row: item.row,
              error: error.message || "Erro ao inserir registro"
            });
          }
        } else {
          results.failed++;
          results.errors.push({
            row: item.row,
            errors: item.errors
          });
        }
      }

      res.json({
        success: true,
        message: `Importação concluída: ${results.inserted} registros inseridos, ${results.failed} falharam`,
        ...results,
        summary: parseResult
      });
    } catch (error: any) {
      console.error("Error importing data:", error);
      res.status(500).json({ error: error.message || "Erro ao importar dados" });
    }
  });

  // Export data with template format
  app.get("/api/export/:type/template", async (req, res) => {
    try {
      const templateType = req.params.type as keyof typeof TEMPLATES;
      const template = TEMPLATES[templateType];

      if (!template) {
        return res.status(404).json({ error: "Template não encontrado" });
      }

      // Get data from storage
      let data: any[] = [];
      switch (templateType) {
        case "equipamentos":
          data = await storage.getEquipamentos();
          break;
        case "pocos":
          data = await storage.getPocos();
          break;
        case "placas_orificio":
          data = await storage.getPlacasOrificio();
          break;
        case "valvulas":
          data = await storage.getValvulas();
          break;
        case "campos":
          data = await storage.getCampos();
          break;
        case "trechos_retos":
          data = await storage.getTrechosRetos();
          break;
        case "analises_quimicas":
          data = await storage.getAnalisesQuimicas();
          break;
        case "controle_incertezas":
          data = await storage.getControleIncertezas();
          break;
        case "instalacoes":
          data = await storage.getInstalacoes();
          break;
        case "pontos_medicao":
          data = await storage.getPontosMedicao();
          break;
        case "plano_calibracoes":
          data = await storage.getPlanoCalibracoes();
          break;
        default:
          return res.status(404).json({ error: "Tipo não suportado" });
      }

      // Transform data to match template columns
      const transformedData = data.map(item => {
        const row: any = {};
        Object.entries(template.fieldMapping).forEach(([excelCol, dbField]: [string, any]) => {
          row[excelCol] = item[dbField];
        });
        return row;
      });

      const excelBuffer = exportToExcel(transformedData, `export_${templateType}.xlsx`, template.name);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=export_${templateType}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting with template:", error);
      res.status(500).json({ error: "Erro ao exportar dados" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
