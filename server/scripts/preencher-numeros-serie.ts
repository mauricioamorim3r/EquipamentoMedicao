import { db } from "../db";
import { equipamentos } from "@shared/schema";
import { eq } from "drizzle-orm";

async function preencherNumerosSerie() {
  console.log("🔍 Verificando equipamentos sem numeroSerie...\n");

  try {
    const todosEquipamentos = await db.query.equipamentos.findMany();

    const semSerie = todosEquipamentos.filter(e => !e.numeroSerie || e.numeroSerie === "");
    const comSerie = todosEquipamentos.filter(e => e.numeroSerie && e.numeroSerie !== "");

    console.log(`📊 Total de equipamentos: ${todosEquipamentos.length}`);
    console.log(`✅ COM numeroSerie: ${comSerie.length}`);
    console.log(`❌ SEM numeroSerie: ${semSerie.length}\n`);

    if (semSerie.length === 0) {
      console.log("✅ Todos os equipamentos já têm numeroSerie preenchido!\n");
      process.exit(0);
    }

    console.log("🔧 Preenchendo numeroSerie para equipamentos que não têm...\n");

    // Contador para gerar números de série únicos
    let contador = 1000;

    for (const equip of semSerie) {
      // Gerar numeroSerie baseado no tipo e ID
      let prefixo = "EQ";
      const tipo = equip.tipo?.toLowerCase() || "";

      if (tipo.includes("placa")) prefixo = "PO";
      else if (tipo.includes("trecho")) prefixo = "TR";
      else if (tipo.includes("válvula") || tipo.includes("valvula")) prefixo = "VLV";
      else if (tipo.includes("medidor") || tipo.includes("coriolis") || tipo.includes("turbina")) prefixo = "MV";
      else if (tipo.includes("transmissor")) prefixo = "TT";
      else if (tipo.includes("sensor")) prefixo = "ST";

      const novoNumeroSerie = `${prefixo}-${String(contador).padStart(4, '0')}-2024`;
      contador++;

      // Atualizar no banco
      await db
        .update(equipamentos)
        .set({ numeroSerie: novoNumeroSerie })
        .where(eq(equipamentos.id, equip.id));

      console.log(`  ✓ ID ${equip.id}: "${equip.nome}" → ${novoNumeroSerie}`);
    }

    console.log(`\n✅ ${semSerie.length} equipamentos atualizados com numeroSerie!\n`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao preencher numeroSerie:", error);
    process.exit(1);
  }
}

preencherNumerosSerie();
