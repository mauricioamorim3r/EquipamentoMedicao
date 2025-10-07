import { test, expect } from '@playwright/test';

test.describe('Debug - Console Errors Investigation', () => {
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    consoleWarnings = [];

    // Capturar todos os erros e warnings do console
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[ERROR] ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(`[WARNING] ${msg.text()}`);
      }
    });

    // Capturar erros de página
    page.on('pageerror', (error) => {
      consoleErrors.push(`[PAGE ERROR] ${error.message}`);
    });
  });

  test('Dashboard - verificar erros ao carregar', async ({ page }) => {
    console.log('\n=== NAVEGANDO PARA DASHBOARD ===');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n📊 ERROS NO DASHBOARD:');
    consoleErrors.forEach(err => console.log(err));
    console.log('\n⚠️ WARNINGS NO DASHBOARD:');
    consoleWarnings.forEach(warn => console.log(warn));
  });

  test('Equipamentos - abrir modal de novo equipamento', async ({ page }) => {
    console.log('\n=== NAVEGANDO PARA EQUIPAMENTOS ===');
    await page.goto('/equipamentos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n📦 ERROS INICIAIS EM EQUIPAMENTOS:');
    consoleErrors.forEach(err => console.log(err));

    // Limpar para capturar apenas erros do modal
    consoleErrors = [];
    consoleWarnings = [];

    // Tentar abrir modal de novo equipamento
    const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Novo")').first();
    if (await addButton.count() > 0) {
      console.log('\n🔘 CLICANDO EM ADICIONAR EQUIPAMENTO...');
      await addButton.click();
      await page.waitForTimeout(1000);

      console.log('\n📝 ERROS AO ABRIR MODAL DE EQUIPAMENTO:');
      consoleErrors.forEach(err => console.log(err));
      console.log('\n⚠️ WARNINGS AO ABRIR MODAL:');
      consoleWarnings.forEach(warn => console.log(warn));

      // Tirar screenshot do modal
      await page.screenshot({ path: 'test-results/modal-equipamento.png', fullPage: true });
    }
  });

  test('Equipamentos - abrir modal de detalhes', async ({ page }) => {
    console.log('\n=== TESTANDO MODAL DE DETALHES ===');
    await page.goto('/equipamentos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    consoleErrors = [];
    consoleWarnings = [];

    const viewButton = page.locator('[data-testid^="button-view-"]').first();
    if (await viewButton.count() > 0) {
      console.log('\n👁️ CLICANDO EM VISUALIZAR EQUIPAMENTO...');
      await viewButton.click();
      await page.waitForTimeout(1000);

      console.log('\n📋 ERROS NO MODAL DE DETALHES:');
      consoleErrors.forEach(err => console.log(err));
      console.log('\n⚠️ WARNINGS NO MODAL DE DETALHES:');
      consoleWarnings.forEach(warn => console.log(warn));

      await page.screenshot({ path: 'test-results/modal-detalhes-equipamento.png', fullPage: true });

      // Tentar clicar em "Agendar Calibração"
      consoleErrors = [];
      const scheduleButton = page.locator('button:has-text("Agendar")');
      if (await scheduleButton.count() > 0) {
        console.log('\n📅 CLICANDO EM AGENDAR CALIBRAÇÃO...');
        await scheduleButton.click();
        await page.waitForTimeout(1000);

        console.log('\n📆 ERROS AO NAVEGAR PARA CALIBRAÇÕES:');
        consoleErrors.forEach(err => console.log(err));
      }
    }
  });

  test('Calibrações - abrir modal de agendamento', async ({ page }) => {
    console.log('\n=== TESTANDO MODAL DE CALIBRAÇÃO ===');
    await page.goto('/calibracoes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    consoleErrors = [];
    consoleWarnings = [];

    const scheduleButton = page.locator('button:has-text("Agendar")').first();
    if (await scheduleButton.count() > 0) {
      console.log('\n📅 CLICANDO EM AGENDAR CALIBRAÇÃO...');
      await scheduleButton.click();
      await page.waitForTimeout(1000);

      console.log('\n📝 ERROS NO MODAL DE AGENDAMENTO:');
      consoleErrors.forEach(err => console.log(err));
      console.log('\n⚠️ WARNINGS NO MODAL DE AGENDAMENTO:');
      consoleWarnings.forEach(warn => console.log(warn));

      await page.screenshot({ path: 'test-results/modal-agendar-calibracao.png', fullPage: true });
    }
  });

  test('Execução de Calibrações - abrir modal de execução', async ({ page }) => {
    console.log('\n=== TESTANDO MODAL DE EXECUÇÃO ===');
    await page.goto('/execucao-calibracoes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    consoleErrors = [];
    consoleWarnings = [];

    const executeButton = page.locator('button:has-text("Executar"), button:has-text("Registrar"), button:has-text("Nova")').first();
    if (await executeButton.count() > 0) {
      console.log('\n⚙️ CLICANDO EM NOVA EXECUÇÃO...');
      await executeButton.click();
      await page.waitForTimeout(1000);

      console.log('\n🔧 ERROS NO MODAL DE EXECUÇÃO:');
      consoleErrors.forEach(err => console.log(err));
      console.log('\n⚠️ WARNINGS NO MODAL DE EXECUÇÃO:');
      consoleWarnings.forEach(warn => console.log(warn));

      await page.screenshot({ path: 'test-results/modal-execucao-calibracao.png', fullPage: true });
    }
  });

  test('Instalações - testar modal de cadastro', async ({ page }) => {
    console.log('\n=== TESTANDO MODAL DE INSTALAÇÕES ===');
    
    const instalacoesLink = page.locator('a[href*="instalac"]');
    if (await instalacoesLink.count() > 0) {
      await instalacoesLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      consoleErrors = [];
      consoleWarnings = [];

      const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova")').first();
      if (await addButton.count() > 0) {
        console.log('\n🏭 CLICANDO EM NOVA INSTALAÇÃO...');
        await addButton.click();
        await page.waitForTimeout(1000);

        console.log('\n🏢 ERROS NO MODAL DE INSTALAÇÃO:');
        consoleErrors.forEach(err => console.log(err));
        console.log('\n⚠️ WARNINGS NO MODAL DE INSTALAÇÃO:');
        consoleWarnings.forEach(warn => console.log(warn));

        await page.screenshot({ path: 'test-results/modal-instalacao.png', fullPage: true });
      }
    }
  });

  test.afterEach(async () => {
    console.log('\n' + '='.repeat(80));
  });
});

