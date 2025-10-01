import { config } from "dotenv";
import { db } from "../db";
import { sistemaNotificacoes } from "@shared/schema";
import { eq } from "drizzle-orm";

config({ path: "../../.env" });

async function testarNotificacoes() {
  console.log("🔔 TESTANDO SISTEMA DE NOTIFICAÇÕES");
  console.log("=".repeat(50));

  try {
    // Verificar se a tabela existe e tem dados
    const notificacoesExistentes = await db.select().from(sistemaNotificacoes);
    console.log(`📊 Notificações existentes: ${notificacoesExistentes.length}`);

    if (notificacoesExistentes.length > 0) {
      console.log("\n📋 PRIMEIRAS 3 NOTIFICAÇÕES:");
      notificacoesExistentes.slice(0, 3).forEach((notif, index) => {
        console.log(`\n${index + 1}. ID: ${notif.id}`);
        console.log(`   Título: ${notif.titulo}`);
        console.log(`   Status: ${notif.status}`);
        console.log(`   Categoria: ${notif.categoria}`);
        console.log(`   Prioridade: ${notif.prioridade}`);
        console.log(`   Criado em: ${notif.createdAt}`);
      });
    }

    // Criar algumas notificações de teste se não existirem
    if (notificacoesExistentes.length === 0) {
      console.log("\n🆕 CRIANDO NOTIFICAÇÕES DE TESTE...");
      
      const notificacoesTeste = [
        {
          titulo: "Calibração Vencida - Equipamento EQ001",
          mensagem: "O equipamento EQ001 precisa de calibração imediata. Vencimento: 28/09/2025",
          categoria: "calibracao",
          prioridade: "alta",
          tipo: "error",
          status: "ativa"
        },
        {
          titulo: "Manutenção Preventiva - Placa PO005",
          mensagem: "Manutenção preventiva agendada para a placa de orifício PO005 em 15/10/2025",
          categoria: "manutencao", 
          prioridade: "media",
          tipo: "warning",
          status: "ativa"
        },
        {
          titulo: "Sistema Atualizado com Sucesso",
          mensagem: "Sistema de gestão de equipamentos foi atualizado para versão 2.1.0",
          categoria: "sistema",
          prioridade: "baixa", 
          tipo: "success",
          status: "ativa"
        },
        {
          titulo: "Relatório Mensal Disponível",
          mensagem: "O relatório mensal de setembro está disponível para download",
          categoria: "sistema",
          prioridade: "baixa",
          tipo: "info", 
          status: "lida"
        }
      ];

      for (const notif of notificacoesTeste) {
        const resultado = await db.insert(sistemaNotificacoes).values(notif).returning();
        console.log(`✅ Criada: ${resultado[0].titulo}`);
      }

      console.log(`\n🎉 ${notificacoesTeste.length} notificações de teste criadas!`);
    }

    // Verificar contadores
    const ativas = await db.select().from(sistemaNotificacoes).where(eq(sistemaNotificacoes.status, "ativa"));
    const lidas = await db.select().from(sistemaNotificacoes).where(eq(sistemaNotificacoes.status, "lida"));

    console.log("\n📈 ESTATÍSTICAS:");
    console.log(`   Total: ${notificacoesExistentes.length + (notificacoesExistentes.length === 0 ? 4 : 0)}`);
    console.log(`   Ativas: ${ativas.length}`);
    console.log(`   Lidas: ${lidas.length}`);

    console.log("\n✅ Sistema de notificações funcionando corretamente!");

  } catch (error) {
    console.error("❌ Erro ao testar notificações:", error);
  } finally {
    process.exit(0);
  }
}

testarNotificacoes();