// Script para configurar MCP em qualquer projeto VS Code
// Execute: node setup-mcp-project.js

const fs = require('fs');
const path = require('path');

// Configuração base do MCP (mesmas APIs que funcionam aqui)
const mcpBaseConfig = {
  render: {
    apiKey: "rnd_93A5yp7fSpEmfErfTuqI4Q51waqA",
    serverUrl: "https://api.render.com/v1",
    features: [
      "list_services",
      "deploy_status", 
      "service_logs",
      "restart_service",
      "env_vars_management"
    ]
  },
  neon: {
    apiKey: "napi_2kizhf9ldo6us0k40msrapepcd7if837x2fjbl90138o0evbo1rnku5pyk4zuzug",
    serverUrl: "https://console.neon.tech/api/v2",
    features: [
      "list_projects",
      "sql_execution",
      "branch_management",
      "connection_strings",
      "database_schema"
    ]
  }
};

// Template de configuração para Claude Desktop
const claudeDesktopConfig = {
  mcpServers: {
    render: {
      command: "npx",
      args: ["-y", "@render/mcp-server"],
      env: {
        RENDER_API_KEY: mcpBaseConfig.render.apiKey
      }
    },
    neon: {
      command: "npx", 
      args: ["-y", "@neon/mcp-server"],
      env: {
        NEON_API_KEY: mcpBaseConfig.neon.apiKey
      }
    }
  }
};

// Função para detectar tipo do projeto
function detectProjectType() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const requirementsPath = path.join(process.cwd(), 'requirements.txt');
  const composerPath = path.join(process.cwd(), 'composer.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.dependencies?.react || pkg.dependencies?.next) return 'react';
    if (pkg.dependencies?.express || pkg.dependencies?.fastify) return 'node-api';
    return 'node';
  }
  
  if (fs.existsSync(requirementsPath)) return 'python';
  if (fs.existsSync(composerPath)) return 'php';
  
  return 'unknown';
}

// Templates por tipo de projeto
const projectTemplates = {
  'react': {
    render: {
      buildCommand: "npm ci && npm run build",
      startCommand: "npm start",
      env: "node",
      type: "web_service"
    }
  },
  'node-api': {
    render: {
      buildCommand: "npm install",
      startCommand: "npm start",
      env: "node", 
      type: "web_service"
    },
    neon: {
      ssl: true,
      pooling: true
    }
  },
  'node': {
    render: {
      buildCommand: "npm install && npm run build",
      startCommand: "npm start", 
      env: "node",
      type: "web_service"
    }
  },
  'python': {
    render: {
      buildCommand: "pip install -r requirements.txt",
      startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT",
      env: "python",
      type: "web_service"
    },
    neon: {
      ssl: true,
      orm: "sqlalchemy"
    }
  }
};

// Função principal de setup
function setupMCPForProject() {
  console.log('🚀 Configurando MCP para este projeto...\n');
  
  const projectType = detectProjectType();
  const projectName = path.basename(process.cwd());
  
  console.log(`📂 Projeto: ${projectName}`);
  console.log(`🔍 Tipo detectado: ${projectType}\n`);
  
  // 1. Criar configuração local do projeto
  const projectConfig = {
    project: {
      name: projectName,
      type: projectType,
      path: process.cwd()
    },
    mcp: mcpBaseConfig,
    templates: projectTemplates[projectType] || projectTemplates.node
  };
  
  fs.writeFileSync('mcp-project-config.json', JSON.stringify(projectConfig, null, 2));
  console.log('✅ Arquivo mcp-project-config.json criado');
  
  // 2. Criar arquivo de comandos MCP
  const mcpCommands = `# 🎯 COMANDOS MCP DISPONÍVEIS PARA ${projectName.toUpperCase()}

## 🔴 RENDER (Deployment & Monitoring)
- "List my Render services"
- "Show deployment status for ${projectName}"
- "Check logs for ${projectName}"
- "Restart service ${projectName}"
- "Show environment variables for ${projectName}"

## 🟢 NEON (Database Management)
- "List my Neon projects"
- "Show connection string for ${projectName}"
- "Run SQL query on ${projectName} database"
- "Create development branch for ${projectName}"
- "Show database schema for ${projectName}"

## 🔄 DEPLOY AUTOMATION
- "Deploy ${projectName} to production" 
- "Create preview deployment for ${projectName}"
- "Check build status for ${projectName}"

## 🛠️ TROUBLESHOOTING
- "Debug deployment issues for ${projectName}"
- "Show recent errors for ${projectName}"
- "Check database connectivity for ${projectName}"
`;
  
  fs.writeFileSync('MCP-COMMANDS.md', mcpCommands);
  console.log('✅ Arquivo MCP-COMMANDS.md criado');
  
  // 3. Criar script de deploy
  const deployScript = `// Deploy script usando MCP para ${projectName}
// Execute: node deploy-mcp.js

const { exec } = require('child_process');
const projectName = '${projectName}';

async function deployWithMCP() {
  console.log('🚀 Iniciando deploy via MCP...');
  
  // Commit e push
  exec('git add .', (error) => {
    if (error) {
      console.log('ℹ️ Nenhuma mudança para commit');
    }
  });
  
  exec(\`git commit -m "deploy: \${projectName} via MCP"\`, (error) => {
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
    console.log('💬 Use no Claude: "Check deployment status for ${projectName}"');
  });
}

deployWithMCP();
`;
  
  fs.writeFileSync('deploy-mcp.js', deployScript);
  console.log('✅ Script deploy-mcp.js criado');
  
  // 4. Mostrar configuração do Claude Desktop
  console.log('\n📋 CONFIGURAÇÃO DO CLAUDE DESKTOP:');
  console.log('Arquivo: %APPDATA%/Claude/claude_desktop_config.json');
  console.log('\nConteúdo:');
  console.log(JSON.stringify(claudeDesktopConfig, null, 2));
  
  console.log('\n🎉 SETUP COMPLETO!');
  console.log('\n📝 Próximos passos:');
  console.log('1. ✅ Configure o Claude Desktop (arquivo acima)');
  console.log('2. ✅ Reinicie o Claude Desktop');
  console.log('3. ✅ Teste: "List my Render services"');
  console.log('4. ✅ Use: node deploy-mcp.js (para deploy)');
  console.log(`5. ✅ Comandos disponíveis em: MCP-COMMANDS.md`);
}

// Executar setup
if (require.main === module) {
  setupMCPForProject();
}

module.exports = { setupMCPForProject, mcpBaseConfig, claudeDesktopConfig };