import { db } from "../db";
import { equipamentos, placasOrificio, trechosRetos, valvulas, medidoresPrimarios } from "@shared/schema";

async function limparEPopular() {
  console.log("🧹 Limpando dados inconsistentes...\n");

  // 1. Deletar todas as placas de orifício
  await db.delete(placasOrificio);
  console.log("✅ Placas de orifício deletadas");

  // 2. Deletar todos os trechos retos
  await db.delete(trechosRetos);
  console.log("✅ Trechos retos deletados");

  // 3. Deletar todas as válvulas
  await db.delete(valvulas);
  console.log("✅ Válvulas deletadas");

  // 4. Deletar todos os medidores primários
  await db.delete(medidoresPrimarios);
  console.log("✅ Medidores primários deletados");

  console.log("\n📦 Criando equipamentos de exemplo...\n");

  // Buscar instalação e polo existentes
  const instalacao = await db.query.instalacoes.findFirst();
  const polo = await db.query.polos.findFirst();

  if (!instalacao || !polo) {
    console.error("❌ Erro: Nenhuma instalação ou polo encontrado");
    process.exit(1);
  }

  // 5. Criar 5 Placas de Orifício
  console.log("Criando Placas de Orifício...");
  const placas = [
    {
      numeroSerie: "PO-001-2024",
      tag: "PO-GAS-001",
      nome: "Placa de Orifício - Medição Gás 1",
      tipo: "Placa de Orifício",
      fabricante: "Rosemount",
      modelo: "Model 1595",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/dia"
    },
    {
      numeroSerie: "PO-002-2024",
      tag: "PO-GAS-002",
      nome: "Placa de Orifício - Medição Gás 2",
      tipo: "Placa de Orifício",
      fabricante: "Rosemount",
      modelo: "Model 1595",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/dia"
    },
    {
      numeroSerie: "PO-003-2024",
      tag: "PO-OIL-001",
      nome: "Placa de Orifício - Medição Óleo 1",
      tipo: "Placa de Orifício",
      fabricante: "Daniel",
      modelo: "Senior Orifice Fitting",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/dia"
    },
    {
      numeroSerie: "PO-004-2024",
      tag: "PO-GAS-003",
      nome: "Placa de Orifício - Medição Gás 3",
      tipo: "Placa de Orifício",
      fabricante: "Rosemount",
      modelo: "Model 1595",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "apropriação",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/dia"
    },
    {
      numeroSerie: "PO-005-2024",
      tag: "PO-GAS-004",
      nome: "Placa de Orifício - Medição Gás 4",
      tipo: "Placa de Orifício",
      fabricante: "Daniel",
      modelo: "Senior Orifice Fitting",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "operacional",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/dia"
    }
  ];

  for (const placa of placas) {
    await db.insert(equipamentos).values(placa);
    console.log(`  ✓ ${placa.tag} - ${placa.numeroSerie}`);
  }

  // 6. Criar 3 Trechos Retos
  console.log("\nCriando Trechos Retos...");
  const trechos = [
    {
      numeroSerie: "TR-001-2024",
      tag: "TR-GAS-001",
      nome: "Trecho Reto - Montante Gás 1",
      tipo: "Trecho Reto",
      fabricante: "Nacional",
      modelo: "Schedule 40",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "mm"
    },
    {
      numeroSerie: "TR-002-2024",
      tag: "TR-GAS-002",
      nome: "Trecho Reto - Jusante Gás 1",
      tipo: "Trecho Reto",
      fabricante: "Nacional",
      modelo: "Schedule 40",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "mm"
    },
    {
      numeroSerie: "TR-003-2024",
      tag: "TR-OIL-001",
      nome: "Trecho Reto - Montante Óleo 1",
      tipo: "Trecho Reto",
      fabricante: "Nacional",
      modelo: "Schedule 80",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "mm"
    }
  ];

  for (const trecho of trechos) {
    await db.insert(equipamentos).values(trecho);
    console.log(`  ✓ ${trecho.tag} - ${trecho.numeroSerie}`);
  }

  // 7. Criar 4 Medidores de Vazão
  console.log("\nCriando Medidores de Vazão...");
  const medidores = [
    {
      numeroSerie: "MV-CORIOLIS-001",
      tag: "FT-GAS-001",
      nome: "Medidor Coriolis - Gás Principal",
      tipo: "Medidor de Vazão - Coriolis",
      fabricante: "Micro Motion",
      modelo: "F-Series F100",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/h"
    },
    {
      numeroSerie: "MV-ULTRA-001",
      tag: "FT-GAS-002",
      nome: "Medidor Ultrassônico - Gás Secundário",
      tipo: "Medidor de Vazão - Ultrassônico",
      fabricante: "Daniel",
      modelo: "SeniorSonic",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/h"
    },
    {
      numeroSerie: "MV-TURBINA-001",
      tag: "FT-OIL-001",
      nome: "Medidor Turbina - Óleo Principal",
      tipo: "Medidor de Vazão - Turbina",
      fabricante: "FMC",
      modelo: "Smith Meter",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/h"
    },
    {
      numeroSerie: "MV-CORIOLIS-002",
      tag: "FT-OIL-002",
      nome: "Medidor Coriolis - Óleo Teste",
      tipo: "Medidor de Vazão - Coriolis",
      fabricante: "Emerson",
      modelo: "CMF300",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "apropriação",
      statusOperacional: "Em Operação",
      unidadeMedida: "m³/h"
    }
  ];

  for (const medidor of medidores) {
    await db.insert(equipamentos).values(medidor);
    console.log(`  ✓ ${medidor.tag} - ${medidor.numeroSerie}`);
  }

  // 8. Criar 3 Válvulas
  console.log("\nCriando Válvulas...");
  const valvulasData = [
    {
      numeroSerie: "VLV-001-2024",
      tag: "SDV-GAS-001",
      nome: "Válvula de Bloqueio - Gás Principal",
      tipo: "Válvula de Bloqueio",
      fabricante: "Cameron",
      modelo: "Gate Valve 6\"",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "pol"
    },
    {
      numeroSerie: "VLV-002-2024",
      tag: "SDV-OIL-001",
      nome: "Válvula de Bloqueio - Óleo Principal",
      tipo: "Válvula de Bloqueio",
      fabricante: "Cameron",
      modelo: "Gate Valve 8\"",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "fiscal",
      statusOperacional: "Em Operação",
      unidadeMedida: "pol"
    },
    {
      numeroSerie: "VLV-003-2024",
      tag: "PCV-GAS-001",
      nome: "Válvula de Controle - Pressão Gás",
      tipo: "Válvula de Controle",
      fabricante: "Fisher",
      modelo: "ED Control Valve",
      instalacaoId: instalacao.id,
      poloId: polo.id,
      classificacao: "operacional",
      statusOperacional: "Em Operação",
      unidadeMedida: "pol"
    }
  ];

  for (const valvula of valvulasData) {
    await db.insert(equipamentos).values(valvula);
    console.log(`  ✓ ${valvula.tag} - ${valvula.numeroSerie}`);
  }

  console.log("\n✅ Script finalizado com sucesso!\n");
  console.log("📊 Resumo:");
  console.log("  - 5 Placas de Orifício");
  console.log("  - 3 Trechos Retos");
  console.log("  - 4 Medidores de Vazão");
  console.log("  - 3 Válvulas");
  console.log("\nTotal: 15 novos equipamentos criados\n");

  process.exit(0);
}

limparEPopular().catch((error) => {
  console.error("❌ Erro ao executar script:", error);
  process.exit(1);
});
