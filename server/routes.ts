import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPoloSchema, insertInstalacaoSchema, insertEquipamentoSchema,
  insertPontoMedicaoSchema, insertPlanoCalibracaoSchema, insertCadastroPocoSchema,
  insertTestePocoSchema, insertPlacaOrificioSchema, insertPlanoColetaSchema, insertAnaliseQuimicaSchema
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

  // Instalações routes
  app.get("/api/instalacoes", async (req, res) => {
    try {
      const poloId = req.query.poloId ? parseInt(req.query.poloId as string) : undefined;
      const instalacoes = await storage.getInstalacoes(poloId);
      res.json(instalacoes);
    } catch (error) {
      console.error("Error fetching instalacoes:", error);
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
      res.status(500).json({ error: "Internal server error" });
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
      const calibracoes = await storage.getPlanosCalibracoes(equipamentoId);
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
      const poco = await storage.createPoço(data);
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
      const placas = await storage.getPlacasOrificio(equipamentoId);
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
      res.status(500).json({ error: "Internal server error" });
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
      const planos = await storage.getPlanosColetas(pontoMedicaoId);
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

  const httpServer = createServer(app);
  return httpServer;
}
