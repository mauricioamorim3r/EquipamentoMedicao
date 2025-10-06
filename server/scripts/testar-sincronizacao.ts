import { db } from "../db";
import { equipamentos, placasOrificio, trechosRetos, valvulas, medidoresPrimarios } from "@shared/schema";

async function testarSincronizacao() {
  console.log("🔍 Testando sincronização entre equipamentos e modais específicos\n");

  try {
    // 1. Buscar todos os equipamentos e filtrar por tipo
    const todosEquipamentos = await db.query.equipamentos.findMany();

    const todasPlacas = todosEquipamentos.filter(e => {
      const tipo = e.tipo?.toLowerCase() || "";
      return tipo.includes("placa") || tipo.includes("orifício") || tipo.includes("orificio");
    });

    const todosTrechos = todosEquipamentos.filter(e => {
      const tipo = e.tipo?.toLowerCase() || "";
      return tipo.includes("trecho") || tipo.includes("reto");
    });

    const todosValvulas = todosEquipamentos.filter(e => {
      const tipo = e.tipo?.toLowerCase() || "";
      return tipo.includes("válvula") || tipo.includes("valvula");
    });

    const todosMedidores = todosEquipamentos.filter(e => {
      const tipo = e.tipo?.toLowerCase() || "";
      return (
        tipo.includes("coriolis") ||
        tipo.includes("ultrassônico") ||
        tipo.includes("ultrassonico") ||
        tipo.includes("turbina") ||
        tipo.includes("deslocamento") ||
        tipo.includes("vortex") ||
        tipo.includes("venturi") ||
        tipo.includes("v-cone") ||
        tipo.includes("vcone")
      );
    });

    // 2. Buscar registros nas tabelas de detalhamento
    const placasDetalhadas = await db.query.placasOrificio.findMany();
    const trechosDetalhados = await db.query.trechosRetos.findMany();
    const valvulasDetalhadas = await db.query.valvulas.findMany();
    const medidoresDetalhados = await db.query.medidoresPrimarios.findMany();

    // 3. Relatório
    console.log("📊 RELATÓRIO DE SINCRONIZAÇÃO\n");

    console.log("=== PLACAS DE ORIFÍCIO ===");
    console.log(`Equipamentos tipo placa: ${todasPlacas.length}`);
    console.log(`Placas com detalhamento: ${placasDetalhadas.length}`);
    console.log("\nEquipamentos disponíveis para detalhamento:");
    todasPlacas.forEach(p => {
      const temDetalhamento = placasDetalhadas.some(d => d.equipamentoId === p.id);
      const status = temDetalhamento ? "✅ TEM" : "❌ SEM";
      console.log(`  ${status} detalhamento - ID: ${p.id}, NumeroSerie: ${p.numeroSerie}, Nome: ${p.nome}`);
    });

    console.log("\n=== TRECHOS RETOS ===");
    console.log(`Equipamentos tipo trecho: ${todosTrechos.length}`);
    console.log(`Trechos com detalhamento: ${trechosDetalhados.length}`);
    console.log("\nEquipamentos disponíveis para detalhamento:");
    todosTrechos.forEach(t => {
      const temDetalhamento = trechosDetalhados.some(d => d.equipamentoId === t.id);
      const status = temDetalhamento ? "✅ TEM" : "❌ SEM";
      console.log(`  ${status} detalhamento - ID: ${t.id}, NumeroSerie: ${t.numeroSerie}, Nome: ${t.nome}`);
    });

    console.log("\n=== VÁLVULAS ===");
    console.log(`Equipamentos tipo válvula: ${todosValvulas.length}`);
    console.log(`Válvulas com detalhamento: ${valvulasDetalhadas.length}`);
    console.log("\nEquipamentos disponíveis para detalhamento:");
    todosValvulas.forEach(v => {
      const temDetalhamento = valvulasDetalhadas.some(d => d.equipamentoId === v.id);
      const status = temDetalhamento ? "✅ TEM" : "❌ SEM";
      console.log(`  ${status} detalhamento - ID: ${v.id}, NumeroSerie: ${v.numeroSerie}, Nome: ${v.nome}`);
    });

    console.log("\n=== MEDIDORES PRIMÁRIOS ===");
    console.log(`Equipamentos tipo medidor: ${todosMedidores.length}`);
    console.log(`Medidores com detalhamento: ${medidoresDetalhados.length}`);
    console.log("\nEquipamentos disponíveis para detalhamento:");
    todosMedidores.forEach(m => {
      const temDetalhamento = medidoresDetalhados.some(d => d.equipamentoId === m.id);
      const status = temDetalhamento ? "✅ TEM" : "❌ SEM";
      console.log(`  ${status} detalhamento - ID: ${m.id}, NumeroSerie: ${m.numeroSerie}, Nome: ${m.nome}`);
    });

    console.log("\n✅ Análise de sincronização concluída!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao testar sincronização:", error);
    process.exit(1);
  }
}

testarSincronizacao();
