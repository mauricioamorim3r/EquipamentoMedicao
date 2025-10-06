/**
 * Script para limpar dados de teste/mock do banco de dados
 * Remove notificações de teste e outros dados simulados
 */

import { db } from "../db";
import { sistemaNotificacoes } from "../../shared/schema";

async function limparDadosTeste() {
  console.log("🧹 LIMPANDO DADOS DE TESTE E MOCK\n");
  console.log("═".repeat(50));

  try {
    // 1. Limpar notificações de teste
    console.log("\n📋 Limpando notificações de teste...");
    const notificacoesDeletadas = await db.delete(sistemaNotificacoes).returning();
    console.log(`✅ ${notificacoesDeletadas.length} notificações removidas`);

    console.log("\n" + "═".repeat(50));
    console.log("✅ LIMPEZA CONCLUÍDA COM SUCESSO!");
    console.log("\n📊 RESUMO:");
    console.log(`   - Notificações removidas: ${notificacoesDeletadas.length}`);
    console.log("\n💡 NOTA: Os dados principais (polos, campos, instalações, equipamentos)");
    console.log("   foram mantidos pois são dados de produção inseridos via seed-data.ts");
    console.log("\n⚠️  Se desejar remover TODOS os dados (incluindo produção):");
    console.log("   Execute: npm run db:push (isso recria o schema vazio)");
    
  } catch (error) {
    console.error("❌ Erro ao limpar dados:", error);
    throw error;
  }

  process.exit(0);
}

// Executar
limparDadosTeste();

