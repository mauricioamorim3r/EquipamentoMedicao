// Script para testar notificações via API
// Execute: node testar-notificacoes-api.js

const API_BASE = 'http://localhost:3000/api';

async function criarNotificacoesTeste() {
  console.log('🔔 CRIANDO NOTIFICAÇÕES DE TESTE...');
  
  const notificacoes = [
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

  try {
    for (const notif of notificacoes) {
      const response = await fetch(`${API_BASE}/notificacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notif)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Criada: ${notif.titulo}`);
      } else {
        console.log(`❌ Erro ao criar: ${notif.titulo} - Status: ${response.status}`);
      }
    }
    
    // Testar busca
    console.log('\n📋 TESTANDO BUSCA...');
    const busca = await fetch(`${API_BASE}/notificacoes`);
    if (busca.ok) {
      const todasNotificacoes = await busca.json();
      console.log(`📊 Total de notificações: ${todasNotificacoes.length}`);
      
      const ativas = todasNotificacoes.filter(n => n.status === 'ativa');
      const lidas = todasNotificacoes.filter(n => n.status === 'lida');
      
      console.log(`🔵 Ativas: ${ativas.length}`);
      console.log(`🟢 Lidas: ${lidas.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

criarNotificacoesTeste();