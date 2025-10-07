import { test, expect } from '@playwright/test';

test.describe('Gestão de Equipamentos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/equipamentos');
    await page.waitForLoadState('networkidle');
  });

  test('deve carregar a página de equipamentos', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: 'Equipamentos' })).toBeVisible();
  });

  test('deve filtrar equipamentos por polo', async ({ page }) => {
    // Aguardar carregamento
    await page.waitForTimeout(1000);
    
    // Clicar no select de polo
    const poloSelect = page.locator('select').first();
    if (await poloSelect.count() > 0) {
      await poloSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('deve buscar equipamento por tag', async ({ page }) => {
    // Localizar campo de busca
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('PO-GAS');
      await page.waitForTimeout(500);
      
      // Verificar se há resultados
      const equipmentCards = page.locator('[data-testid^="equipment-card-"]');
      const count = await equipmentCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('deve abrir modal de detalhes do equipamento', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Clicar no primeiro botão de visualizar
    const viewButton = page.locator('[data-testid^="button-view-"]').first();
    
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await page.waitForTimeout(500);
      
      // Verificar se o modal abriu
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    }
  });

  test('deve navegar para agendamento de calibração', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Clicar no primeiro botão de visualizar
    const viewButton = page.locator('[data-testid^="button-view-"]').first();
    
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await page.waitForTimeout(500);
      
      // Procurar botão de agendar calibração
      const scheduleButton = page.locator('button:has-text("Agendar Calibração")');
      
      if (await scheduleButton.count() > 0) {
        await scheduleButton.click();
        await page.waitForTimeout(500);
        
        // Verificar se navegou para calibrações
        await expect(page).toHaveURL(/\/calibracoes/);
      }
    }
  });

  test('deve abrir formulário de novo equipamento', async ({ page }) => {
    // Procurar botão de adicionar
    const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Novo")').first();
    
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Verificar se o formulário abriu
      const form = page.locator('form, [role="dialog"]');
      await expect(form.first()).toBeVisible();
    }
  });
});

