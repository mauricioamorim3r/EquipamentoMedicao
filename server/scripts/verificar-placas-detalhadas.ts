import { config } from "dotenv";
import { db } from "../db";
import { placasOrificio } from "../../shared/schema";

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
      console.log(`   Número Série: ${placa.numeroSerie}`);
      console.log(`   Equipamento ID: ${placa.equipamentoId || 'NULL'}`);
      console.log(`   Material: ${placa.material || 'NULL'}`);
      console.log(`   Diâmetro Externo: ${placa.diametroExterno || 'NULL'}`);
      console.log(`   Diâmetro Orifício 20°C: ${placa.diametroOrificio20c || 'NULL'}`);
      console.log(`   Espessura: ${placa.espessura || 'NULL'}`);
      console.log(`   Vazão Mínima: ${placa.vazaoMinima || 'NULL'}`);
      console.log(`   Vazão Máxima: ${placa.vazaoMaxima || 'NULL'}`);
      console.log(`   Observação: ${placa.observacao || 'NULL'}`);
    });

    // Verificar equipamentos vinculados
    const comEquipamento = placas.filter(p => p.equipamentoId !== null);
    const semEquipamento = placas.filter(p => p.equipamentoId === null);
    console.log(`\n📊 ANÁLISE DE EQUIPAMENTOS:`);
    console.log(`   - Com equipamento vinculado: ${comEquipamento.length} placas`);
    console.log(`   - Sem equipamento: ${semEquipamento.length} placas`);

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