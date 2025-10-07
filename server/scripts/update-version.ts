#!/usr/bin/env tsx

/**
 * Script para atualizar a versão do sistema automaticamente
 * Atualiza Service Workers, cache headers e versionamento
 */

import fs from 'fs';
import path from 'path';

const VERSION_FILE = path.resolve(import.meta.dirname, '..', '..', 'VERSION');
const SW_ENHANCED_PATH = path.resolve(import.meta.dirname, '..', '..', 'client', 'public', 'sw-enhanced.js');
const SW_PATH = path.resolve(import.meta.dirname, '..', '..', 'client', 'public', 'sw.js');

function getCurrentVersion(): string {
  try {
    if (fs.existsSync(VERSION_FILE)) {
      return fs.readFileSync(VERSION_FILE, 'utf-8').trim();
    }
  } catch (error) {
    console.warn('Could not read VERSION file:', error);
  }
  return '1.0.0';
}

function generateNewVersion(): string {
  const now = new Date();
  const timestamp = now.getTime();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  return `v${dateStr}-${timestamp.toString().slice(-6)}`;
}

function updateServiceWorker(filePath: string, version: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Atualizar versão no Service Worker
    const versionRegex = /const VERSION = ['"`]v\d+['"`];/;
    const newVersionLine = `const VERSION = '${version}';`;
    
    if (versionRegex.test(content)) {
      content = content.replace(versionRegex, newVersionLine);
    } else {
      // Se não encontrar o padrão, adicionar após os comentários iniciais
      const lines = content.split('\n');
      const insertIndex = lines.findIndex(line => line.includes('const CACHE_NAME') || line.includes('const STATIC_CACHE'));
      if (insertIndex > 0) {
        lines.splice(insertIndex, 0, newVersionLine);
        content = lines.join('\n');
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated ${path.basename(filePath)} with version ${version}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
  }
}

function updateVersionFile(version: string) {
  try {
    fs.writeFileSync(VERSION_FILE, version, 'utf-8');
    console.log(`✅ Updated VERSION file: ${version}`);
  } catch (error) {
    console.error('❌ Error updating VERSION file:', error);
  }
}

function main() {
  console.log('🔄 Atualizando versão do sistema...');
  console.log('══════════════════════════════════════════════════');
  
  const currentVersion = getCurrentVersion();
  const newVersion = generateNewVersion();
  
  console.log(`📋 Versão atual: ${currentVersion}`);
  console.log(`📋 Nova versão: ${newVersion}`);
  
  // Atualizar arquivos
  updateServiceWorker(SW_ENHANCED_PATH, newVersion);
  updateServiceWorker(SW_PATH, newVersion);
  updateVersionFile(newVersion);
  
  console.log('══════════════════════════════════════════════════');
  console.log('✅ Atualização de versão concluída!');
  console.log('');
  console.log('📝 Próximos passos:');
  console.log('   1. Execute: npm run build');
  console.log('   2. Faça deploy da aplicação');
  console.log('   3. Os usuários receberão automaticamente a nova versão');
  console.log('');
  console.log('🧹 Para limpar cache dos usuários:');
  console.log('   - Acesse: /clear-cache.html');
  console.log('   - Ou execute: npm run clear-cache');
}

main();
