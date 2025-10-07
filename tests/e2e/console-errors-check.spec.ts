import { test, expect, Page } from '@playwright/test';

/**
 * VERIFICAÇÃO DE ERROS NO CONSOLE
 *
 * Este script verifica erros de console em todas as páginas da aplicação,
 * com foco especial em erros de WebSocket/Socket
 */

// Lista de páginas a serem verificadas
const PAGES_TO_CHECK = [
  { path: '/', name: 'Dashboard' },
  { path: '/equipamentos', name: 'Equipamentos' },
  { path: '/calibracoes', name: 'Calibrações' },
  { path: '/execucao-calibracoes', name: 'Execução de Calibrações' },
  { path: '/historico-calibracoes', name: 'Histórico de Calibrações' },
  { path: '/campos', name: 'Campos' },
  { path: '/pocos', name: 'Poços' },
  { path: '/instalacoes', name: 'Instalações' },
  { path: '/pontos-medicao', name: 'Pontos de Medição' },
  { path: '/notificacoes', name: 'Notificações' },
  { path: '/placas-orificio', name: 'Placas de Orifício' },
  { path: '/trechos-retos', name: 'Trechos Retos' },
  { path: '/medidores-primarios', name: 'Medidores Primários' },
  { path: '/protecao-lacre', name: 'Proteção e Lacre' },
  { path: '/valvulas', name: 'Válvulas' },
  { path: '/gestao-cilindros', name: 'Gestão de Cilindros' },
  { path: '/testes-pocos', name: 'Testes de Poços' },
  { path: '/analises-quimicas', name: 'Análises Químicas' },
  { path: '/controle-incertezas', name: 'Controle de Incertezas' },
  { path: '/relatorios', name: 'Relatórios' },
  { path: '/ajuda', name: 'Ajuda' },
];

interface ConsoleError {
  type: string;
  message: string;
  page: string;
}

test.describe('VERIFICAÇÃO DE ERROS NO CONSOLE', () => {
  let allErrors: ConsoleError[] = [];

  for (const pageInfo of PAGES_TO_CHECK) {
    test(`verificar console em: ${pageInfo.name}`, async ({ page }) => {
      const pageErrors: ConsoleError[] = [];

      // Capturar mensagens do console
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const errorMsg = msg.text();
          pageErrors.push({
            type: 'console.error',
            message: errorMsg,
            page: pageInfo.name
          });
          console.log(`❌ [${pageInfo.name}] Console Error: ${errorMsg}`);
        }
      });

      // Capturar erros de página
      page.on('pageerror', (error) => {
        pageErrors.push({
          type: 'page.error',
          message: error.message,
          page: pageInfo.name
        });
        console.log(`❌ [${pageInfo.name}] Page Error: ${error.message}`);
      });

      // Capturar falhas de requisição
      page.on('requestfailed', (request) => {
        const failure = request.failure();
        if (failure) {
          pageErrors.push({
            type: 'request.failed',
            message: `${request.url()} - ${failure.errorText}`,
            page: pageInfo.name
          });
          console.log(`❌ [${pageInfo.name}] Request Failed: ${request.url()} - ${failure.errorText}`);
        }
      });

      // Navegar para a página
      console.log(`\n🔍 Verificando: ${pageInfo.name} (${pageInfo.path})`);
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      // Aguardar um tempo para capturar erros assíncronos
      await page.waitForTimeout(3000);

      // Categorizar erros
      const socketErrors = pageErrors.filter(e =>
        e.message.toLowerCase().includes('socket') ||
        e.message.toLowerCase().includes('websocket') ||
        e.message.toLowerCase().includes('ws://')
      );

      const otherErrors = pageErrors.filter(e =>
        !e.message.toLowerCase().includes('socket') &&
        !e.message.toLowerCase().includes('websocket') &&
        !e.message.toLowerCase().includes('ws://') &&
        !e.message.toLowerCase().includes('favicon')
      );

      // Relatório da página
      console.log(`📊 Total de erros: ${pageErrors.length}`);
      console.log(`  🔌 Erros de Socket/WebSocket: ${socketErrors.length}`);
      console.log(`  ⚠️ Outros erros: ${otherErrors.length}`);

      if (socketErrors.length > 0) {
        console.log(`\n  🔌 Detalhes dos erros de Socket:`);
        socketErrors.forEach((err, idx) => {
          console.log(`    ${idx + 1}. [${err.type}] ${err.message}`);
        });
      }

      if (otherErrors.length > 0) {
        console.log(`\n  ⚠️ Outros erros encontrados:`);
        otherErrors.forEach((err, idx) => {
          console.log(`    ${idx + 1}. [${err.type}] ${err.message}`);
        });
      }

      if (pageErrors.length === 0) {
        console.log(`✅ Nenhum erro encontrado`);
      }

      allErrors.push(...pageErrors);
    });
  }

  test.afterAll(async () => {
    console.log(`\n\n📊 ===== RESUMO GERAL DE ERROS =====\n`);

    const socketErrors = allErrors.filter(e =>
      e.message.toLowerCase().includes('socket') ||
      e.message.toLowerCase().includes('websocket') ||
      e.message.toLowerCase().includes('ws://')
    );

    const otherErrors = allErrors.filter(e =>
      !e.message.toLowerCase().includes('socket') &&
      !e.message.toLowerCase().includes('websocket') &&
      !e.message.toLowerCase().includes('ws://') &&
      !e.message.toLowerCase().includes('favicon')
    );

    console.log(`Total de páginas verificadas: ${PAGES_TO_CHECK.length}`);
    console.log(`Total de erros encontrados: ${allErrors.length}`);
    console.log(`  🔌 Erros de Socket/WebSocket: ${socketErrors.length}`);
    console.log(`  ⚠️ Outros erros: ${otherErrors.length}\n`);

    if (socketErrors.length > 0) {
      console.log(`🔌 ERROS DE SOCKET/WEBSOCKET POR PÁGINA:\n`);
      const socketByPage: Record<string, ConsoleError[]> = {};

      socketErrors.forEach(err => {
        if (!socketByPage[err.page]) {
          socketByPage[err.page] = [];
        }
        socketByPage[err.page].push(err);
      });

      Object.entries(socketByPage).forEach(([pageName, errors]) => {
        console.log(`  ${pageName}: ${errors.length} erro(s)`);
        errors.forEach(err => {
          console.log(`    - ${err.message}`);
        });
        console.log('');
      });
    }

    if (otherErrors.length > 0) {
      console.log(`⚠️ OUTROS ERROS POR PÁGINA:\n`);
      const errorsByPage: Record<string, ConsoleError[]> = {};

      otherErrors.forEach(err => {
        if (!errorsByPage[err.page]) {
          errorsByPage[err.page] = [];
        }
        errorsByPage[err.page].push(err);
      });

      Object.entries(errorsByPage).forEach(([pageName, errors]) => {
        console.log(`  ${pageName}: ${errors.length} erro(s)`);
        errors.forEach(err => {
          console.log(`    - [${err.type}] ${err.message}`);
        });
        console.log('');
      });
    }

    if (allErrors.length === 0) {
      console.log(`✅ Nenhum erro encontrado em nenhuma página!`);
    }

    console.log(`\n===== FIM DO RELATÓRIO =====\n`);
  });
});
