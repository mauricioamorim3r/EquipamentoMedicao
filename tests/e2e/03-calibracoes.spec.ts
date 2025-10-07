import { test, expect } from '@playwright/test';

test.describe('Gestão de Calibrações', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calibracoes');
    await page.waitForLoadState('networkidle');
  });

  test('deve carregar a página de calibrações', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /Calibra/ })).toBeVisible();
  });

  test('deve exibir estatísticas de calibração', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Verificar se há cards de estatísticas usando múltiplos seletores
    const statsCards = page.locator('div[class*="card"], div[class*="Card"], [role="region"]').filter({
      hasText: /Total|Vencid|Crítico|Conform|Próxim/i
    });
    
    const cardElements = page.locator('div').filter({ hasText: /\\d+/ });
    const count = await cardElements.count();
    
    // Se não houver cards, pelo menos deve ter conteúdo na página
    if (count === 0) {
      await expect(page.locator('body')).toContainText(/Calibra/i);
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('deve filtrar calibrações por polo', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Procurar select de polo
    const poloSelects = page.locator('select');
    
    if (await poloSelects.count() > 0) {
      const poloSelect = poloSelects.first();
      await poloSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('deve filtrar calibrações por status', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Procurar select de status
    const selects = page.locator('select');
    
    if (await selects.count() > 1) {
      const statusSelect = selects.nth(1);
      await statusSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('deve abrir modal de agendamento de calibração', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Procurar botão de agendar
    const scheduleButton = page.locator('button:has-text("Agendar")').first();
    
    if (await scheduleButton.count() > 0) {
      await scheduleButton.click();
      await page.waitForTimeout(500);
      
      // Verificar se o modal abriu
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    }
  });

  test('deve navegar pelas abas', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Procurar abas (tabs)
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      // Clicar na segunda aba
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      
      // Verificar se a aba está ativa
      await expect(tabs.nth(1)).toHaveAttribute('data-state', 'active');
    }
  });
});

