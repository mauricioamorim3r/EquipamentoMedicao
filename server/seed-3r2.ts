import { storage } from "./storage";
import { installacao3R2Data } from "./data/3r2-equipment-data";

export async function seed3R2Data() {
  try {
    console.log("🌱 Iniciando população dos dados da instalação 3R-2...");

    // 1. Verificar/Criar Polo
    let polos = await storage.getPolos();
    let polo3R = polos.find(p => p.nome.includes("3R"));
    
    if (!polo3R) {
      polo3R = await storage.createPolo({
        nome: "Polo 3R - Região Norte",
        sigla: "3R",
        diretoria: "Região Norte - Brasil",
        empresa: "Petrobras",
        status: "ativo"
      });
      console.log(`✅ Polo criado: ${polo3R.nome}`);
    }

    // 2. Verificar/Criar Campo
    let campos = await storage.getCampos(polo3R.id);
    let campo3R = campos.find(c => c.nome.includes("3R"));
    
    if (!campo3R) {
      campo3R = await storage.createCampo({
        nome: "Campo 3R",
        sigla: "3R",
        poloId: polo3R.id,
        diretoria: "Campo Petrolífero 3R",
        empresa: "Petrobras",
        status: "ativo"
      });
      console.log(`✅ Campo criado: ${campo3R.nome}`);
    }

    // 3. Verificar/Criar Instalação 3R-2
    let instalacoes = await storage.getInstalacoes(campo3R.id);
    let instalacao3R2 = instalacoes.find(i => i.nome.includes("3R-2"));
    
    if (!instalacao3R2) {
      instalacao3R2 = await storage.createInstalacao({
        nome: "Instalação 3R-2",
        sigla: "3R-2",
        poloId: polo3R.id,
        campoId: campo3R.id,
        tipo: "Plataforma Marítima",
        situacao: "Plataforma 3R-2",
        status: "ativo"
      });
      console.log(`✅ Instalação criada: ${instalacao3R2.nome}`);
    }

    // 4. Criar Equipamentos da 3R-2
    let equipamentosExistentes = await storage.getEquipamentos({ instalacaoId: instalacao3R2.id });
    let equipamentosCriados = 0;

    for (const equipData of installacao3R2Data.equipamentos) {
      const existe = equipamentosExistentes.find(e => e.tag === equipData.tag);
      
      if (!existe) {
        await storage.createEquipamento({
          tag: equipData.tag,
          nome: equipData.nome,
          poloId: polo3R.id,
          instalacaoId: instalacao3R2.id,
          tipo: equipData.tipo,
          numeroSerie: equipData.numeroSerie || "",
          status: equipData.status || "Ativo",
          fabricante: equipData.fabricante,
          modelo: equipData.modelo
        });
        equipamentosCriados++;
      }
    }
    console.log(`✅ ${equipamentosCriados} equipamentos criados da 3R-2`);

    // 5. Criar Execuções de Calibração de Exemplo
    let execucoesCriadas = 0;
    const equipamentosAtualizados = await storage.getEquipamentos({ instalacaoId: instalacao3R2.id });
    
    for (const execData of installacao3R2Data.execucoesCalibracaoExemplo) {
      const equipamento = equipamentosAtualizados.find(e => e.tag === execData.equipamentoTag);
      
      if (equipamento) {
        try {
          await storage.createExecucaoCalibracao({
            equipamentoId: equipamento.id,
            numeroSerieEquipamento: equipamento.numeroSerie,
            tagEquipamento: equipamento.tag,
            nomeEquipamento: equipamento.nome,
            diasParaAlertar: execData.diasParaAlertar,
            frequenciaCalibracaoMeses: execData.frequenciaCalibracaoMeses,
            
            // Último Certificado
            numeroUltimoCertificado: execData.numeroUltimoCertificado,
            statusUltimoCertificado: execData.statusUltimoCertificado,
            laboratorioUltimo: execData.laboratorioUltimo,
            dataEmissaoUltimo: execData.dataEmissaoUltimo,
            meterFactorUltimo: execData.meterFactorUltimo,
            kFactorUltimo: execData.kFactorUltimo,
            incertezaCalibracaoUltimo: execData.incertezaCalibracaoUltimo,
            erroMaximoAdmissivelAnpUltimo: execData.erroMaximoAdmissivelUltimo,
            
            observacaoUltimo: execData.observacoesUltimo,
            observacoes: `Aplicabilidade: ${execData.aplicabilidade}, Fluido: ${execData.fluido}, Ponto: ${execData.pontoMedicao}, Local: ${execData.localCalibracao}`
          });
          execucoesCriadas++;
        } catch (error) {
          console.log(`⚠️ Erro ao criar execução para ${execData.equipamentoTag}:`, error);
        }
      }
    }
    console.log(`✅ ${execucoesCriadas} execuções de calibração criadas`);

    // 6. Resumo dos Padrões Identificados
    console.log("\n📊 Padrões identificados na 3R-2:");
    console.log(`- Aplicabilidades: ${installacao3R2Data.padroes.aplicabilidades.join(", ")}`);
    console.log(`- Tipos de equipamentos: ${installacao3R2Data.padroes.tiposEquipamentos.length} tipos diferentes`);
    console.log(`- Prefixos de TAGs: ${installacao3R2Data.padroes.prefixosTags.join(", ")}`);
    console.log(`- Laboratórios: ${installacao3R2Data.padroes.laboratorios.join(", ")}`);
    console.log(`- Fluidos: ${installacao3R2Data.padroes.fluidos.join(", ")}`);

    console.log("\n🎉 População dos dados da 3R-2 concluída com sucesso!");
    
    return {
      success: true,
      summary: {
        polo: polo3R.nome,
        campo: campo3R.nome, 
        instalacao: instalacao3R2.nome,
        equipamentosCriados,
        execucoesCriadas,
        padroes: installacao3R2Data.padroes
      }
    };

  } catch (error) {
    console.error("❌ Erro ao popular dados da 3R-2:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Função para executar o seed via linha de comando
seed3R2Data()
  .then((result) => {
    if (result.success) {
      console.log("✅ Dados da 3R-2 populados com sucesso!");
      console.log(result.summary);
    } else {
      console.error("❌ Falha ao popular dados:", result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });