import { db } from "../db";

async function listarEquipamentos() {
  console.log("📋 Listando todos os equipamentos...\n");

  try {
    const todosEquipamentos = await db.query.equipamentos.findMany({
      orderBy: (equipamentos, { asc }) => [asc(equipamentos.id)]
    });

    console.log(`Total: ${todosEquipamentos.length} equipamentos\n`);
    console.log("ID  | NumeroSerie        | Tipo                           | Nome");
    console.log("----|--------------------|--------------------------------|-------------------------------------");

    todosEquipamentos.forEach(e => {
      const id = String(e.id).padEnd(3);
      const serie = (e.numeroSerie || "VAZIO").padEnd(18);
      const tipo = (e.tipo || "SEM TIPO").substring(0, 30).padEnd(30);
      const nome = (e.nome || "SEM NOME").substring(0, 35);
      console.log(`${id} | ${serie} | ${tipo} | ${nome}`);
    });

    console.log("\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao listar equipamentos:", error);
    process.exit(1);
  }
}

listarEquipamentos();
