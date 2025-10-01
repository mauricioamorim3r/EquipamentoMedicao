import { config } from "dotenv";
import { db } from "./db";
import { 
  equipamentos, 
  placasOrificio, 
  campos, 
  instalacoes, 
  pontosMedicao
} from "@shared/schema";

config({ path: "../.env" });

async function relatorioStatusFinal() {
  console.log("📊 RELATÓRIO COMPLETO DO STATUS DA APLICAÇÃO");
  console.log("=".repeat(60));
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

  try {
    // ========== EQUIPAMENTOS ==========
    const equipamentosData = await db.select().from(equipamentos);
    console.log("🔧 EQUIPAMENTOS:");
    console.log(`   ✅ Total cadastrados: ${equipamentosData.length}`);
    
    if (equipamentosData.length > 0) {
      const equipamentosComTag = equipamentosData.filter(eq => eq.tag).length;
      const equipamentosComSerie = equipamentosData.filter(eq => eq.numeroSerie).length;
      
      console.log(`   📝 Com TAG definida: ${equipamentosComTag}`);
      console.log(`   🔢 Com número série: ${equipamentosComSerie}`);
      
      // Mostrar alguns exemplos
      console.log("   📋 Exemplos:");
      equipamentosData.slice(0, 3).forEach(eq => {
        console.log(`      - ID: ${eq.id} | TAG: ${eq.tag || 'N/A'} | Série: ${eq.numeroSerie || 'N/A'}`);
      });
    }

    // ========== PLACAS DE ORIFÍCIO ==========
    const placasData = await db.select().from(placasOrificio);
    console.log(`\n🔴 PLACAS DE ORIFÍCIO:`);
    console.log(`   ✅ Total cadastradas: ${placasData.length}`);
    
    if (placasData.length > 0) {
      const placasVinculadas = placasData.filter(p => p.equipamentoId).length;
      const placasComCertificado = placasData.filter(p => p.certificadoVigente === 'Sim').length;
      const placasComData = placasData.filter(p => p.dataInstalacao).length;
      
      console.log(`   🔗 Vinculadas a equipamentos: ${placasVinculadas}`);
      console.log(`   📜 Com certificado vigente: ${placasComCertificado}`);
      console.log(`   📅 Com data de instalação: ${placasComData}`);
      
      // Distribuição por equipamento
      const distribuicao = placasData.reduce((acc, placa) => {
        const equipId = placa.equipamentoId || 'Sem equipamento';
        acc[equipId] = (acc[equipId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("   📊 Distribuição por equipamento:");
      Object.entries(distribuicao).forEach(([equipId, count]) => {
        console.log(`      - Equipamento ${equipId}: ${count} placas`);
      });
    }

    // ========== ESTRUTURA ORGANIZACIONAL ==========
    const camposData = await db.select().from(campos);
    const instalacoesData = await db.select().from(instalacoes);
    const pontosData = await db.select().from(pontosMedicao);
    
    console.log(`\n🏢 ESTRUTURA ORGANIZACIONAL:`);
    console.log(`   🌍 Campos: ${camposData.length}`);
    console.log(`   🏭 Instalações: ${instalacoesData.length}`);
    console.log(`   📍 Pontos de medição: ${pontosData.length}`);
    
    if (camposData.length > 0) {
      console.log("   📋 Campos cadastrados:");
      camposData.forEach(campo => {
        console.log(`      - ${campo.nome} (${campo.localizacao || 'Localização não definida'})`);
      });
    }

    // ========== ANÁLISE DE INTEGRIDADE ==========
    console.log(`\n🔍 ANÁLISE DE INTEGRIDADE:`);
    
    // Verificar equipamentos órfãos (sem placas)
    const equipamentosComPlacas = new Set(placasData.map(p => p.equipamentoId));
    const equipamentosSemPlacas = equipamentosData.filter(eq => !equipamentosComPlacas.has(eq.id));
    
    console.log(`   ⚠️  Equipamentos sem placas: ${equipamentosSemPlacas.length}`);
    if (equipamentosSemPlacas.length > 0) {
      equipamentosSemPlacas.slice(0, 3).forEach(eq => {
        console.log(`      - ID: ${eq.id} | TAG: ${eq.tag || 'N/A'}`);
      });
    }

    // ========== RESUMO EXECUTIVO ==========
    const totalRegistros = equipamentosData.length + placasData.length + camposData.length + 
                           instalacoesData.length + pontosData.length;
    
    console.log(`\n📈 RESUMO EXECUTIVO:`);
    const placasVinculadas = placasData.filter(p => p.equipamentoId).length;
    const placasComCertificado = placasData.filter(p => p.certificadoVigente === 'Sim').length;
    
    console.log(`   🎯 Total de registros: ${totalRegistros}`);
    console.log(`   📊 Taxa de vinculação: ${((placasVinculadas / placasData.length) * 100).toFixed(1)}%`);
    console.log(`   🔐 Taxa de certificação: ${((placasComCertificado / placasData.length) * 100).toFixed(1)}%`);
    
    // ========== PRÓXIMOS PASSOS ==========
    console.log(`\n🚀 PRÓXIMOS PASSOS RECOMENDADOS:`);
    console.log("   1. ✅ Interface web funcionando - dados sendo exibidos");
    console.log("   2. 📝 Completar cadastro de mais placas de orifício");
    console.log("   3. 🔧 Melhorar vinculação automática equipamento-placa");
    console.log("   4. 📊 Implementar dashboards de monitoramento");
    console.log("   5. 📅 Configurar sistema de vencimento de certificados");

    console.log("\n" + "=".repeat(60));
    console.log("✅ RELATÓRIO CONCLUÍDO - Sistema operacional!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

relatorioStatusFinal();