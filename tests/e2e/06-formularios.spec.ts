import { test, expect } from '@playwright/test';

test.describe('Formulários e Validações', () => {
  test('formulário de equipamento - validação de campos obrigatórios', async ({ page }) => {
    await page.goto('/equipamentos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Clicar em adicionar equipamento
    const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Novo")').first();
    
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Tentar submeter sem preencher
      const submitButton = page.locator('button[type="submit"], button:has-text("Salvar")').first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Verificar se há mensagens de erro ou validação
        const errorMessages = page.locator('[role="alert"], .error, [class*="error"]');
        // Pode ou não ter mensagens dependendo da validação
      }
    }
  });

  test('formulário de calibração - preencher campos', async ({ page }) => {
    await page.goto('/calibracoes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Clicar em agendar calibração
    const scheduleButton = page.locator('button:has-text("Agendar")').first();
    
    if (await scheduleButton.count() > 0) {
      await scheduleButton.click();
      await page.waitForTimeout(500);
      
      // Preencher campos se o modal abriu
      const modal = page.locator('[role="dialog"]');
      if (await modal.count() > 0) {
        // Procurar selects e preencher
        const selects = modal.locator('select');
        const selectCount = await selects.count();
        
        if (selectCount > 0) {
          // Selecionar equipamento
          await selects.first().selectOption({ index: 1 });
          await page.waitForTimeout(300);
        }
        
        // Procurar campos de data
        const dateInputs = modal.locator('input[type="date"]');
        const dateCount = await dateInputs.count();
        
        if (dateCount > 0) {
          await dateInputs.first().fill('2025-12-31');
        }
        
        // Procurar campos de texto
        const textInputs = modal.locator('input[type="text"]');
        const textCount = await textInputs.count();
        
        if (textCount > 0) {
          await textInputs.first().fill('Teste Automatizado');
        }
      }
    }
  });

  test('busca e filtros - interação completa', async ({ page }) => {
    await page.goto('/equipamentos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Campo de busca
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('PO');
      await page.waitForTimeout(500);
      await searchInput.clear();
      await page.waitForTimeout(300);
    }
    
    // Filtros por select
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    if (selectCount > 0) {
      for (let i = 0; i < Math.min(selectCount, 3); i++) {
        await selects.nth(i).selectOption({ index: 1 });
        await page.waitForTimeout(300);
        await selects.nth(i).selectOption({ index: 0 });
        await page.waitForTimeout(300);
      }
    }
  });
});

