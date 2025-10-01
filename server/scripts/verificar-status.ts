import { config } from "dotenv";
import { db } from "./db";
import { 
  equipamentos, 
  placasOrificio, 
  campos, 
  instalacoes, 
  pontosMedicao,
  planoCalibracoes,
  certificadosCalibração,
  execucaoCalibracoes,
  planoColetas,
  cadastroPocos,
  testesPocos,
  trechosRetos,
  medidoresPrimarios,
  gestaoCilindros,
  analisesFisicoQuimicasGenerica,
  analisesCromatografia,
  analisesPvt
} from "@shared/schema";

config({ path: "../.env" });

async function verificarStatusCadastros() {
  console.log("📊 VERIFICANDO STATUS DOS CADASTROS\n");
  console.log("=" .repeat(50));

  try {
    // Verificar equipamentos
    const totalEquipamentos = await db.select().from(equipamentos);
    console.log(`🔧 EQUIPAMENTOS: ${totalEquipamentos.length} cadastrados`);
    
    if (totalEquipamentos.length > 0) {
      const equipamentosPorTipo = totalEquipamentos.reduce((acc, eq) => {
        const tipo = eq.tipoEquipamento || 'Não especificado';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(equipamentosPorTipo).forEach(([tipo, count]) => {
        console.log(`   - ${tipo}: ${count}`);
      });
    }

    // Verificar placas de orifício
    const totalPlacas = await db.select().from(placasOrificio);
    console.log(`\n🔴 PLACAS DE ORIFÍCIO: ${totalPlacas.length} cadastradas`);
    
    if (totalPlacas.length > 0) {
      const placasPorStatus = totalPlacas.reduce((acc, placa) => {
        const status = placa.status || 'Sem status';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(placasPorStatus).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });

      const placasComEquipamento = totalPlacas.filter(p => p.equipamentoId !== null);
      console.log(`   - Vinculadas a equipamentos: ${placasComEquipamento.length}`);
      console.log(`   - Sem equipamento: ${totalPlacas.length - placasComEquipamento.length}`);
    }

    // Verificar campos
    const totalCampos = await db.select().from(campos);
    console.log(`\n🌍 CAMPOS: ${totalCampos.length} cadastrados`);
    
    if (totalCampos.length > 0) {
      totalCampos.forEach(campo => {
        console.log(`   - ${campo.nome} (${campo.localizacao || 'Localização não especificada'})`);
      });
    }

    // Verificar instalações
    const totalInstalacoes = await db.select().from(instalacoes);
    console.log(`\n🏭 INSTALAÇÕES: ${totalInstalacoes.length} cadastradas`);
    
    if (totalInstalacoes.length > 0) {
      totalInstalacoes.forEach(inst => {
        console.log(`   - ${inst.nome} (Tipo: ${inst.tipoInstalacao || 'N/A'})`);
      });
    }

    // Verificar pontos de medição
    const totalPontos = await db.select().from(pontosMedicao);
    console.log(`\n📍 PONTOS DE MEDIÇÃO: ${totalPontos.length} cadastrados`);

    // Verificar planos de calibração
    const totalPlanoCalibracoes = await db.select().from(planoCalibracoes);
    console.log(`\n📅 PLANOS DE CALIBRAÇÃO: ${totalPlanoCalibracoes.length} registrados`);

    // Verificar execuções de calibração
    const totalExecucaoCalibracoes = await db.select().from(execucaoCalibracoes);
    console.log(`\n🎯 EXECUÇÕES DE CALIBRAÇÃO: ${totalExecucaoCalibracoes.length} registradas`);

    // Verificar certificados de calibração
    const totalCertificados = await db.select().from(certificadosCalibração);
    console.log(`\n📜 CERTIFICADOS DE CALIBRAÇÃO: ${totalCertificados.length} registrados`);

    // Verificar planos de coleta
    const totalPlanoColetas = await db.select().from(planoColetas);
    console.log(`\n📋 PLANOS DE COLETA: ${totalPlanoColetas.length} registrados`);

    // Verificar poços cadastrados
    const totalPocos = await db.select().from(cadastroPocos);
    console.log(`\n🛢️ POÇOS: ${totalPocos.length} cadastrados`);

    // Verificar testes de poços
    const totalTestesPocos = await db.select().from(testesPocos);
    console.log(`\n🧪 TESTES DE POÇOS: ${totalTestesPocos.length} registrados`);

    // Verificar trechos retos
    const totalTrechosRetos = await db.select().from(trechosRetos);
    console.log(`\n📏 TRECHOS RETOS: ${totalTrechosRetos.length} cadastrados`);

    // Verificar medidores primários
    const totalMedidores = await db.select().from(medidoresPrimarios);
    console.log(`\n📊 MEDIDORES PRIMÁRIOS: ${totalMedidores.length} cadastrados`);

    // Verificar gestão de cilindros
    const totalCilindros = await db.select().from(gestaoCilindros);
    console.log(`\n🏺 CILINDROS: ${totalCilindros.length} registrados`);

    // Verificar análises físico-químicas
    const totalAnalisesFQ = await db.select().from(analisesFisicoQuimicasGenerica);
    console.log(`\n🧪 ANÁLISES FÍSICO-QUÍMICAS: ${totalAnalisesFQ.length} registradas`);

    // Verificar análises de cromatografia
    const totalCromatografia = await db.select().from(analisesCromatografia);
    console.log(`\n� ANÁLISES DE CROMATOGRAFIA: ${totalCromatografia.length} registradas`);

    // Verificar análises PVT
    const totalPvt = await db.select().from(analisesPvt);
    console.log(`\n🌡️ ANÁLISES PVT: ${totalPvt.length} registradas`);

    console.log("\n" + "=" .repeat(50));
    console.log("✅ RESUMO GERAL:");
    const totalGeral = totalEquipamentos.length + 
      totalPlacas.length + 
      totalCampos.length + 
      totalInstalacoes.length + 
      totalPontos.length + 
      totalPlanoCalibracoes.length + 
      totalExecucaoCalibracoes.length + 
      totalCertificados.length + 
      totalPlanoColetas.length + 
      totalPocos.length + 
      totalTestesPocos.length + 
      totalTrechosRetos.length + 
      totalMedidores.length + 
      totalCilindros.length + 
      totalAnalisesFQ.length + 
      totalCromatografia.length + 
      totalPvt.length;
    
    console.log(`   Total de registros: ${totalGeral}`);

    // Verificar últimas atividades (se houver timestamps)
    console.log("\n📅 ÚLTIMAS ATIVIDADES:");
    
    // Equipamentos com data mais recente
    const equipamentosRecentes = totalEquipamentos
      .filter(eq => eq.dataAquisicao)
      .sort((a, b) => new Date(b.dataAquisicao!).getTime() - new Date(a.dataAquisicao!).getTime())
      .slice(0, 3);
    
    if (equipamentosRecentes.length > 0) {
      console.log("   Equipamentos recentes:");
      equipamentosRecentes.forEach(eq => {
        console.log(`   - ${eq.tag || eq.numeroSerie} (${eq.dataAquisicao})`);
      });
    }

    // Placas com calibração mais recente
    const placasComCalibracao = totalPlacas
      .filter(p => p.ultimaCalibracao)
      .sort((a, b) => new Date(b.ultimaCalibracao!).getTime() - new Date(a.ultimaCalibracao!).getTime())
      .slice(0, 3);
    
    if (placasComCalibracao.length > 0) {
      console.log("   Placas calibradas recentemente:");
      placasComCalibracao.forEach(placa => {
        console.log(`   - ${placa.tag} (${placa.ultimaCalibracao})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao verificar status:", error);
    process.exit(1);
  }
}

verificarStatusCadastros();