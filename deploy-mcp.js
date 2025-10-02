// Deploy script usando MCP para EquipamentoMedicao
// Execute: node deploy-mcp.js

const { exec } = require('child_process');
const projectName = 'EquipamentoMedicao';

async function deployWithMCP() {
  console.log('🚀 Iniciando deploy via MCP...');
  
  // Commit e push
  exec('git add .', (error) => {
    if (error) {
      console.log('ℹ️ Nenhuma mudança para commit');
    }
  });
  
  exec(`git commit -m "deploy: ${projectName} via MCP"`, (error) => {
    if (error) {
      console.log('ℹ️ Nenhuma mudança para commit');
    }
  });
  
  exec('git push origin main', (error, stdout) => {
    if (error) {
      console.error('❌ Erro no push:', error);
      return;
    }
    console.log('✅ Push realizado com sucesso!');
    console.log('🔄 Auto-deploy disparado no Render');
    console.log('💬 Use no Claude: "Check deployment status for EquipamentoMedicao"');
  });
}

deployWithMCP();
