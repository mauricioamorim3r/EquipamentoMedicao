import { config } from "dotenv";
import { db } from "./db";
import { placasOrificio } from "@shared/schema";
import { instalacao3R3PlacasData } from "./data/3r3-orifice-plates-data";

config({ path: "../.env" });

async function recriarPlacasOrificio() {
  console.log("🗑️ Limpando dados antigos...");
  
  try {
    // Limpar todos os dados antigos
    await db.delete(placasOrificio);
    console.log("✓ Dados antigos removidos");

    // Inserir novos dados completos
    console.log("📝 Inserindo dados completos...");
    
    const result = await db.insert(placasOrificio).values(instalacao3R3PlacasData.placasOrificio).returning();
    
    console.log(`✅ ${result.length} placas inseridas com sucesso!`);
    
    // Verificar alguns dados inseridos
    const amostra = result.slice(0, 3);
    console.log("\n📋 Amostra dos dados inseridos:");
    amostra.forEach((placa, i) => {
      console.log(`${i+1}. ${placa.tag} - ${placa.status} - ${placa.numeroSerie}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

recriarPlacasOrificio();
