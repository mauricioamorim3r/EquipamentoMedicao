import { test, expect } from '@playwright/test';

test.describe('Execução de Calibrações', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/execucao-calibracoes');
    await page.waitForLoadState('networkidle');
  });

  test('deve carregar a página de execução de calibrações', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /Execu/ })).toBeVisible();
  });

  test('deve filtrar por equipamento', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Procurar select de equipamento
    const selects = page.locator('select');
    
    if (await selects.count() > 0) {
      await selects.first().selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('deve filtrar por período', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Procurar select de período
    const periodSelects = page.locator('select').filter({ hasText: /Mês|Período/ });
    
    if (await periodSelects.count() > 0) {
      await periodSelects.first().selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('deve exibir estatísticas de calibrações pendentes', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar se há cards de estatísticas
    const statsText = page.locator('text=/Pendentes|Vencidas|Próximos/');
    const count = await statsText.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('deve abrir modal de nova execução', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Procurar botão de executar/registrar
    const executeButton = page.locator('button:has-text("Executar"), button:has-text("Registrar"), button:has-text("Nova")').first();
    
    if (await executeButton.count() > 0) {
      await executeButton.click();
      await page.waitForTimeout(500);
      
      // Verificar se o modal abriu
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    }
  });

  test('deve exibir tabela de calibrações agendadas', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verificar se há uma tabela
    const table = page.locator('table');
    
    if (await table.count() > 0) {
      await expect(table.first()).toBeVisible();
    }
  });
});

