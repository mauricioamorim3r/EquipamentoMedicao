import { db } from "./db.js";

console.log("🔍 Testando conexão e estrutura do banco...");

try {
  // Testar se o db está acessível
  console.log("Database object:", !!db);
  
  // Tentar fazer uma query simples
  const result = await db.query.polos.findMany();
  console.log("✅ Conexão com banco funcionando!");
  console.log("📊 Polos encontrados:", result.length);
  
} catch (error) {
  console.error("❌ Erro ao conectar:", error);
  process.exit(1);
}

process.exit(0);