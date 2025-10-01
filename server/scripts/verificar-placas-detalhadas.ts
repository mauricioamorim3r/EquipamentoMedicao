import { config } from "dotenv";
import { db } from "./db";
import { placasOrificio } from "@shared/schema";

config({ path: "../.env" });

async function verificarPlacasDetalhadas() {
  console.log("🔍 VERIFICANDO PLACAS DE ORIFÍCIO EM DETALHES\n");

  try {
    const placas = await db.select().from(placasOrificio);
    
    console.log(`Total de placas: ${placas.length}\n`);
    
    // Mostrar as primeiras 5 placas com todos os campos
    console.log("📋 PRIMEIRAS 5 PLACAS:");
    placas.slice(0, 5).forEach((placa, index) => {
      console.log(`\n${index + 1}. Placa ID: ${placa.id}`);
      console.log(`   Tag: ${placa.tag}`);
      console.log(`   Número Série: ${placa.numeroSerie}`);
      console.log(`   Ponto Medição: ${placa.pontoMedicao}`);
      console.log(`   Status: ${placa.status || 'NULL'}`);
      console.log(`   Equipamento ID: ${placa.equipamentoId || 'NULL'}`);
      console.log(`   Diâmetro: ${placa.diametroOrificio || 'NULL'}`);
      console.log(`   Tag Medidor: ${placa.tagMedidor || 'NULL'}`);
      console.log(`   Última Calibração: ${placa.ultimaCalibracao || 'NULL'}`);
      console.log(`   Vencimento ANP: ${placa.vencimentoANP || 'NULL'}`);
      console.log(`   Observações: ${placa.observacoes || 'NULL'}`);
    });

    // Verificar todos os status únicos
    const statusUnicos = [...new Set(placas.map(p => p.status || 'NULL'))];
    console.log(`\n📊 STATUS ÚNICOS ENCONTRADOS:`);
    statusUnicos.forEach(status => {
      const count = placas.filter(p => (p.status || 'NULL') === status).length;
      console.log(`   - ${status}: ${count} placas`);
    });

    // Verificar estrutura da tabela (campos definidos vs dados reais)
    const camposComDados = Object.keys(placas[0]).filter(key => 
      placas.some(placa => placa[key] !== null && placa[key] !== undefined)
    );
    
    console.log(`\n📝 CAMPOS COM DADOS:`);
    camposComDados.forEach(campo => {
      const countComDados = placas.filter(p => p[campo] !== null && p[campo] !== undefined).length;
      console.log(`   - ${campo}: ${countComDados}/${placas.length} placas`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

verificarPlacasDetalhadas();