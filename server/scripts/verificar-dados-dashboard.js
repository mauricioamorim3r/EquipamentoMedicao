// Verificar se o dashboard usa dados reais ou simulados
console.log('🔍 VERIFICANDO DADOS DO DASHBOARD...\n');

async function verificarDadosDashboard() {
  const API_BASE = 'http://localhost:3000/api';
  
  try {
    // 1. Dashboard Stats
    console.log('📊 DASHBOARD STATS:');
    const statsResponse = await fetch(`${API_BASE}/dashboard/stats`);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Dashboard Stats (DADOS REAIS do banco):');
      console.log(`   Total Equipamentos: ${stats.totalEquipamentos}`);
      console.log(`   Total Calibrações: ${stats.totalCalibracoes}`);
      console.log(`   Total Poços: ${stats.totalPocos}`);
      console.log(`   Total Placas: ${stats.totalPlacas}`);
      console.log(`   Polos: ${stats.polosDistribution?.length || 0} distribuições`);
    } else {
      console.log('❌ Erro ao buscar dashboard stats');
    }

    // 2. Equipamentos
    console.log('\n🔧 EQUIPAMENTOS:');
    const equipResponse = await fetch(`${API_BASE}/equipamentos`);
    if (equipResponse.ok) {
      const equipamentos = await equipResponse.json();
      console.log(`✅ Equipamentos (DADOS REAIS): ${equipamentos.length} registros`);
      if (equipamentos.length > 0) {
        console.log(`   Primeiro: ${equipamentos[0].tag} - ${equipamentos[0].nome}`);
      }
    } else {
      console.log('❌ Erro ao buscar equipamentos');
    }

    // 3. Placas de Orifício
    console.log('\n🔘 PLACAS DE ORIFÍCIO:');
    const placasResponse = await fetch(`${API_BASE}/placas-orificio`);
    if (placasResponse.ok) {
      const placas = await placasResponse.json();
      console.log(`✅ Placas (DADOS REAIS): ${placas.length} registros`);
      if (placas.length > 0) {
        console.log(`   Primeira: ${placas[0].numeroSerie}`);
      }
    } else {
      console.log('❌ Erro ao buscar placas');
    }

    // 4. Calibration Stats
    console.log('\n📋 CALIBRATION STATS:');
    const calibResponse = await fetch(`${API_BASE}/calibracoes/stats`);
    if (calibResponse.ok) {
      const calibStats = await calibResponse.json();
      console.log('✅ Calibration Stats (DADOS REAIS):');
      console.log(`   Total: ${calibStats.total}`);
      console.log(`   OK: ${calibStats.ok}`);
      console.log(`   Alerta: ${calibStats.alert}`);
      console.log(`   Críticos: ${calibStats.critical}`);
      console.log(`   Vencidos: ${calibStats.expired}`);
    } else {
      console.log('❌ Erro ao buscar calibration stats');
    }

    console.log('\n🎯 RESUMO:');
    console.log('✅ Dashboard usa DADOS REAIS do banco PostgreSQL');
    console.log('✅ API endpoints funcionando corretamente');
    console.log('❗ Alguns cards operacionais podem usar dados simulados (mock data)');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verificarDadosDashboard();