import { db } from "../db";
import { equipamentos, placasOrificio, trechosRetos, valvulas, medidoresPrimarios } from "@shared/schema";
import { isNotNull } from "drizzle-orm";

async function limparDetalhamentos() {
  console.log("🧹 Limpando todos os registros de detalhamento...\n");

  try {
    // 1. Deletar todas as placas de orifício
    const deletedPlacas = await db.delete(placasOrificio);
    console.log("✅ Placas de orifício deletadas");

    // 2. Deletar todos os trechos retos
    const deletedTrechos = await db.delete(trechosRetos);
    console.log("✅ Trechos retos deletados");

    // 3. Deletar todas as válvulas
    const deletedValvulas = await db.delete(valvulas);
    console.log("✅ Válvulas deletadas");

    // 4. Deletar todos os medidores primários
    const deletedMedidores = await db.delete(medidoresPrimarios);
    console.log("✅ Medidores primários deletados");

    console.log("\n📊 Verificando equipamentos sem numeroSerie...\n");

    // 5. Listar equipamentos sem numeroSerie
    const equipamentosSemSerie = await db.query.equipamentos.findMany({
      where: (equipamentos, { isNull, or, eq }) =>
        or(
          isNull(equipamentos.numeroSerie),
          eq(equipamentos.numeroSerie, "")
        )
    });

    if (equipamentosSemSerie.length > 0) {
      console.log(`⚠️  Encontrados ${equipamentosSemSerie.length} equipamentos sem numeroSerie:`);
      equipamentosSemSerie.forEach(eq => {
        console.log(`   - ID: ${eq.id}, Nome: ${eq.nome}, Tipo: ${eq.tipo}`);
      });
    } else {
      console.log("✅ Todos os equipamentos têm numeroSerie preenchido");
    }

    console.log("\n✅ Limpeza concluída com sucesso!\n");
    console.log("📋 Resumo:");
    console.log("  - Todas as placas de orifício foram removidas");
    console.log("  - Todos os trechos retos foram removidos");
    console.log("  - Todas as válvulas foram removidas");
    console.log("  - Todos os medidores primários foram removidos");
    console.log("\n🎯 Agora os equipamentos estão prontos para novos detalhamentos!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar limpeza:", error);
    process.exit(1);
  }
}

limparDetalhamentos();
