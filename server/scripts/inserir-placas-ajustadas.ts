import { config } from "dotenv";
import { db } from "../db";
import { placasOrificio } from "../../shared/schema";

config({ path: "../.env" });

async function inserirPlacasAjustadas() {
  console.log("📝 Inserindo placas com schema correto...");
  
  try {
    // Limpar dados antigos
    await db.delete(placasOrificio);
    console.log("✓ Dados antigos removidos");
    
    // Dados ajustados para o schema atual
    const placasAjustadas = [
      {
        equipamentoId: 1, // Assumindo que existe equipamento com ID 1
        numeroSerie: "MVM-0095-19",
        material: "Aço Inox 316L",
        diametroOrificio20c: 26.10,
        certificadoVigente: "Sim",
        dataInstalacao: "2019-03-15",
        observacao: "Placa em operação normal - 45-FE-5400B.1"
      },
      {
        equipamentoId: 1,
        numeroSerie: "MVM-0093-19", 
        material: "Aço Inox 316L",
        diametroOrificio20c: 21.50,
        certificadoVigente: "Sim",
        dataInstalacao: "2019-02-28",
        observacao: "Backup da placa principal - FE-5400 A-B"
      },
      {
        equipamentoId: 1,
        numeroSerie: "MVM-0094-19",
        material: "Aço Inox 316L", 
        diametroOrificio20c: 19.20,
        certificadoVigente: "Não",
        observacao: "Certificado vencido - 45-FE-5400 A/B"
      },
      {
        equipamentoId: 2,
        numeroSerie: "PO 14583-23-01",
        material: "Aço Inox 316L",
        diametroOrificio20c: 24.80,
        certificadoVigente: "Sim",
        dataInstalacao: "2023-04-12",
        observacao: "Placa nova - 45-FE-5401B.1"
      },
      {
        equipamentoId: 2,
        numeroSerie: "PO 14583-23-03",
        material: "Aço Inox 316L",
        diametroOrificio20c: 22.00,
        certificadoVigente: "Sim",
        observacao: "Placa reserva - 45-FE-5401 A/B"
      },
      {
        equipamentoId: 3,
        numeroSerie: "MVM-0096-19",
        material: "Aço Inox 316L",
        diametroOrificio20c: 28.50,
        certificadoVigente: "Sim",
        dataInstalacao: "2019-05-20",
        observacao: "Operação normal - 45-FE-5402B.1"
      },
      {
        equipamentoId: 3,
        numeroSerie: "MVM-0097-19",
        material: "Aço Inox 316L",
        diametroOrificio20c: 25.20,
        certificadoVigente: "Sim",
        dataInstalacao: "2019-05-20",
        observacao: "Placa secundária - 45-FE-5402 A/B"
      },
      {
        equipamentoId: 4,
        numeroSerie: "PO 14584-23-01",
        material: "Aço Inox 316L",
        diametroOrificio20c: 23.70,
        certificadoVigente: "Sim",
        dataInstalacao: "2023-06-08",
        observacao: "Instalação recente - 45-FE-5403B.1"
      },
      {
        equipamentoId: 4,
        numeroSerie: "PO 14584-23-02",
        material: "Aço Inox 316L",
        diametroOrificio20c: 20.10,
        certificadoVigente: "Sim",
        observacao: "Reserva técnica - 45-FE-5403 A/B"
      },
      {
        equipamentoId: 5,
        numeroSerie: "MVM-0098-19",
        material: "Aço Inox 316L",
        diametroOrificio20c: 27.30,
        certificadoVigente: "Sim",
        dataInstalacao: "2019-07-10",
        observacao: "Operação estável - 45-FE-5404B.1"
      }
    ];

    const result = await db.insert(placasOrificio).values(placasAjustadas).returning();
    
    console.log(`✅ ${result.length} placas inseridas com sucesso!`);
    
    // Verificar dados inseridos
    console.log("\n📋 Placas inseridas:");
    result.forEach((placa, i) => {
      console.log(`${i+1}. ${placa.numeroSerie} - Equip ID: ${placa.equipamentoId} - Diâmetro: ${placa.diametroOrificio20c}mm`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

inserirPlacasAjustadas();