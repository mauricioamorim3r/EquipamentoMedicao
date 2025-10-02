import { EQUIPAMENTOS_TEMPLATE } from "./server/templateUtils.js";

console.log("🔍 ANÁLISE DOS TEMPLATES DE IMPORTAÇÃO/EXPORTAÇÃO");
console.log("=".repeat(60));

// Lista de campos do schema de equipamentos
const camposSchema = [
  "id", "numeroSerie", "tag", "nome", "tipo", "modelo", "fabricante",
  "unidadeMedida", "resolucao", "faixaMinEquipamento", "faixaMaxEquipamento",
  "faixaMinPam", "faixaMaxPam", "faixaMinCalibrada", "faixaMaxCalibrada",
  "condicoesAmbientaisOperacao", "softwareVersao", "instalacaoId", "poloId",
  "classificacao", "frequenciaCalibracao", "ativoMxm", "planoManutencao",
  "criterioAceitacao", "erroMaximoAdmissivel", "statusOperacional", "status",
  "createdAt", "updatedAt"
];

// Lista de campos no template
const camposTemplate = Object.values(EQUIPAMENTOS_TEMPLATE.fieldMapping);

console.log("📊 COMPARAÇÃO - EQUIPAMENTOS:");
console.log(`Schema tem: ${camposSchema.length} campos`);
console.log(`Template tem: ${camposTemplate.length} campos`);

console.log("\n❌ CAMPOS NO SCHEMA MAS AUSENTES NO TEMPLATE:");
const faltandoNoTemplate = camposSchema.filter(campo => 
  !camposTemplate.includes(campo) && 
  !['id', 'createdAt', 'updatedAt'].includes(campo)
);
faltandoNoTemplate.forEach(campo => console.log(`  - ${campo}`));

console.log("\n✅ CAMPOS NO TEMPLATE MAS AUSENTES NO SCHEMA:");
const faltandoNoSchema = camposTemplate.filter(campo => 
  !camposSchema.includes(campo)
);
faltandoNoSchema.forEach(campo => console.log(`  - ${campo}`));

console.log("\n🎯 RECOMENDAÇÕES:");
if (faltandoNoTemplate.length > 0) {
  console.log("- Adicionar campos ausentes ao template para importação completa");
}
if (faltandoNoSchema.length > 0) {
  console.log("- Revisar campos do template que não existem no schema");
}