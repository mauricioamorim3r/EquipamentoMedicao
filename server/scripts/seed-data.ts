import { db } from "../db";
import { polos, campos, instalacoes, equipamentos, pontosMedicao, trechosRetos, placasOrificio } from "../../shared/schema";

export async function seedDatabase() {
  console.log("🌱 Inserindo dados de exemplo...");

  try {
    // Verificar se já existem dados
    const existingPolos = await db.select().from(polos).limit(1);
    if (existingPolos.length > 0) {
      console.log("ℹ️  Dados já existem no banco. Pulando inserção...");
      return;
    }

    // Inserir Polos
    const polosData = await db.insert(polos).values([
      {
        nome: "Polo de Búzios",  
        sigla: "BUZ"
      },
      {
        nome: "Polo de Marlim",
        sigla: "MAR"
      }
    ]).returning();

    console.log(`✅ ${polosData.length} polos inseridos`);

    // Inserir Campos
    const camposData = await db.insert(campos).values([
      {
        poloId: polosData[0].id,
        nome: "Campo de Búzios",
        sigla: "BUZ"
      },
      {
        poloId: polosData[1].id,
        nome: "Campo de Marlim",
        sigla: "MAR"
      }
    ]).returning();

    console.log(`✅ ${camposData.length} campos inseridos`);

    // Inserir Instalações
    const instalacoesData = await db.insert(instalacoes).values([
      {
        poloId: polosData[0].id,
        nome: "FPSO Búzios V",
        sigla: "FPSO-BUZ-V"
      },
      {
        poloId: polosData[1].id,
        nome: "P-37 Marlim Sul",
        sigla: "P-37"
      }
    ]).returning();

    console.log(`✅ ${instalacoesData.length} instalações inseridas`);

    // Inserir Equipamentos
    const equipamento1 = await db.insert(equipamentos).values({
      numeroSerie: "TR001-2024",
      tag: "TR-GAS-001-BUZ",
      nome: "Trecho Reto Medição Gás Principal",
      tipo: "Trecho Reto",
      modelo: "TR-DN200-CL600",
      fabricante: "FMC Technologies",
      unidadeMedida: "m³/h",
      faixaMinEquipamento: 1000,
      faixaMaxEquipamento: 15000,
      instalacaoId: instalacoesData[0].id,
      poloId: polosData[0].id,
      classificacao: "Fiscal",
      frequenciaCalibracao: 24,
      statusOperacional: "Em Operação",
      status: "ativo"
    } as any).returning();

    const equipamento2 = await db.insert(equipamentos).values({
      numeroSerie: "PO001-2024", 
      tag: "PO-GAS-001-BUZ",
      nome: "Placa Orifício Medição Gás Principal",
      tipo: "Placa de Orifício",
      modelo: "PO-DN200-Beta065",
      fabricante: "Daniel Measurement",
      unidadeMedida: "m³/h",
      faixaMinEquipamento: 1000,
      faixaMaxEquipamento: 15000,
      instalacaoId: instalacoesData[0].id,
      poloId: polosData[0].id,
      classificacao: "Fiscal",
      frequenciaCalibracao: 24,
      statusOperacional: "Em Operação",
      status: "ativo"
    } as any).returning();

    const equipamento3 = await db.insert(equipamentos).values({
      numeroSerie: "TR002-2024",
      tag: "TR-OIL-001-MAR",
      nome: "Trecho Reto Medição Óleo Principal",
      tipo: "Trecho Reto",
      modelo: "TR-DN150-CL900",
      fabricante: "Cameron",
      unidadeMedida: "m³/h",
      faixaMinEquipamento: 500,
      faixaMaxEquipamento: 8000,
      instalacaoId: instalacoesData[1].id,
      poloId: polosData[1].id,
      classificacao: "Fiscal",
      frequenciaCalibracao: 24,
      statusOperacional: "Em Operação",
      status: "ativo"
    } as any).returning();

    const equipamentosData = [...equipamento1, ...equipamento2, ...equipamento3];

    console.log(`✅ ${equipamentosData.length} equipamentos inseridos`);

    // Inserir Pontos de Medição
    const pontoMedicao1 = await db.insert(pontosMedicao).values({
      poloId: polosData[0].id,
      instalacaoId: instalacoesData[0].id,
      tag: "PM-GAS-001",
      nome: "Ponto Medição Gás Principal",
      classificacao: "Fiscal",
      localizacao: "Manifold Principal",
      tipoMedidorPrimario: "Placa de Orifício",
      status: "ativo"
    } as any).returning();

    const pontoMedicao2 = await db.insert(pontosMedicao).values({
      poloId: polosData[1].id,
      instalacaoId: instalacoesData[1].id,
      tag: "PM-OIL-001",
      nome: "Ponto Medição Óleo Principal",
      classificacao: "Fiscal",
      localizacao: "Header de Produção",
      tipoMedidorPrimario: "Placa de Orifício",
      status: "ativo"
    } as any).returning();

    const pontosMedicaoData = [...pontoMedicao1, ...pontoMedicao2];

    console.log(`✅ ${pontosMedicaoData.length} pontos de medição inseridos`);

    // Inserir Trechos Retos
    const trechoReto1 = await db.insert(trechosRetos).values({
      numeroSerie: "TR001-2024",
      equipamentoId: equipamentosData[0].id,
      campoId: camposData[0].id,
      instalacaoId: instalacoesData[0].id,
      pontoInstalacaoId: pontosMedicaoData[0].id,
      classe: "600",
      diametroNominal: 200,
      diametroReferencia20c: 200.5,
      tipoAco: "AISI 316L",
      tagTrechoMontanteCondicionador: "TC-001",
      numeroSerieTrechoMontanteCondicionador: "TC001-2024",
      tagTrechoMontantePlaca: "TMP-001",
      numeroSerieTrechoMontantePlaca: "TMP001-2024",
      tagCondicionadorFluxo: "CF-001",
      numeroSerieCondicionadorFluxo: "CF001-2024",
      numeroSeriePortaPlaca: "PP001-2024",
      tagTrechoJusante: "TJ-001",
      numeroSerieTrechoJusante: "TJ001-2024",
      certificadoVigente: "CERT-TR-001-2024",
      norma: "AGA 3",
      dataInspecao: new Date("2024-01-15"),
      dataInstalacao: new Date("2024-02-01"),
      cartaNumero: "CT-001/2024",
      observacao: "Trecho reto principal para medição fiscal de gás"
    } as any).returning();

    const trechoReto2 = await db.insert(trechosRetos).values({
      numeroSerie: "TR002-2024",
      equipamentoId: equipamentosData[2].id,
      campoId: camposData[1].id,
      instalacaoId: instalacoesData[1].id,
      pontoInstalacaoId: pontosMedicaoData[1].id,
      classe: "900",
      diametroNominal: 150,
      diametroReferencia20c: 150.8,
      tipoAco: "Duplex 2205",
      tagTrechoMontanteCondicionador: "TC-002",
      numeroSerieTrechoMontanteCondicionador: "TC002-2024",
      tagTrechoMontantePlaca: "TMP-002",
      numeroSerieTrechoMontantePlaca: "TMP002-2024",
      tagCondicionadorFluxo: "CF-002",
      numeroSerieCondicionadorFluxo: "CF002-2024",
      numeroSeriePortaPlaca: "PP002-2024",
      tagTrechoJusante: "TJ-002",
      numeroSerieTrechoJusante: "TJ002-2024",
      certificadoVigente: "CERT-TR-002-2024",
      norma: "API 14.3",
      dataInspecao: new Date("2024-01-20"),
      dataInstalacao: new Date("2024-02-10"),
      cartaNumero: "CT-002/2024",
      observacao: "Trecho reto para medição fiscal de óleo"
    } as any).returning();

    const trechosRetosData = [...trechoReto1, ...trechoReto2];

    console.log(`✅ ${trechosRetosData.length} trechos retos inseridos`);

    // Inserir Placas de Orifício
    const placasOrificioData = await db.insert(placasOrificio).values({
      numeroSerie: "PO001-2024",
      equipamentoId: equipamentosData[1].id,
      campoId: camposData[0].id,
      instalacaoId: instalacoesData[0].id,
      pontoInstalacaoId: pontosMedicaoData[0].id,
      material: "AISI 316L",
      diametroExterno: 300,
      diametroOrificio20c: 130.2,
      espessura: 3.18,
      vazaoMinima: 1000,
      vazaoMaxima: 15000,
      diametroNominal: 200,
      diametroInternoMedio: 200.5,
      diametroInternoMedio20c: 200.5,
      certificadoVigente: "CERT-PO-001-2024",
      norma: "AGA 3",
      dataInspecao: new Date("2024-01-15"),
      dataInstalacao: new Date("2024-02-01"),
      cartaNumero: "CT-PO-001/2024",
      observacao: "Placa de orifício para medição fiscal de gás"
    } as any).returning();

    console.log(`✅ ${placasOrificioData.length} placas de orifício inseridas`);

    console.log("🎉 Dados de exemplo inseridos com sucesso!");

  } catch (error) {
    console.error("❌ Erro ao inserir dados:", error);
    throw error;
  }
}

// Executar diretamente
seedDatabase()
  .then(() => {
    console.log("✅ Seeding concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro no seeding:", error);
    process.exit(1);
  });