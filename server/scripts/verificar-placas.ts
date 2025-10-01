import { config } from "dotenv";
import { db } from "./db";
import { placasOrificio } from "@shared/schema";

config({ path: "../.env" });

async function verificarPlacas() {
  console.log("🔍 Verificando placas no banco...");
  
  const todasPlacas = await db.select().from(placasOrificio);
  console.log(`📊 Total de placas: ${todasPlacas.length}`);
  
  const placasComEquipamento = todasPlacas.filter(p => p.equipamentoId !== null);
  const placasSemEquipamento = todasPlacas.filter(p => p.equipamentoId === null);
  
  console.log(`✓ Placas com equipamento: ${placasComEquipamento.length}`);
  console.log(`❌ Placas sem equipamento: ${placasSemEquipamento.length}`);
  
  if (todasPlacas.length > 0) {
    console.log("\n📋 Primeiras 3 placas:");
    todasPlacas.slice(0, 3).forEach(placa => {
      console.log(`  - ${placa.tag} (${placa.numeroSerie}) - Equip ID: ${placa.equipamentoId}`);
    });
  }
}

verificarPlacas();
