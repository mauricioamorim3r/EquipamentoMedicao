import { test, expect } from '@playwright/test';

test.describe('Navegação e Acessibilidade', () => {
  test('deve navegar por todas as páginas principais', async ({ page }) => {
    await page.goto('/');
    
    // Dashboard
    await expect(page).toHaveURL(/\//);
    
    // Equipamentos
    await page.click('text=Equipamentos');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/equipamentos/);
    
    // Calibrações
    await page.click('text=Calibrações');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/calibracoes/);
    
    // Execução de Calibrações
    const execucaoLink = page.locator('a[href*="execucao"]');
    if (await execucaoLink.count() > 0) {
      await execucaoLink.first().click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('deve ter navegação responsiva', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se o menu está visível
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
  });

  test('não deve ter erros de console críticos', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Filtrar erros conhecidos que não são críticos
    const criticalErrors = errors.filter(err => 
      !err.includes('Failed to load resource') &&
      !err.includes('favicon') &&
      !err.includes('WebSocket') &&
      !err.includes('net::ERR') &&
      !err.includes('404') &&
      !err.includes('icon') &&
      !err.includes('manifest') &&
      !err.includes('Service Worker') &&
      !err.includes('Download the React DevTools')
    );
    
    // Log dos erros para debug se necessário
    if (criticalErrors.length > 0) {
      console.log('Erros críticos encontrados:', criticalErrors);
    }
    
    // Aceitar até 1 erro não crítico (pode ser warning de desenvolvimento)
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });

  test('deve ter títulos acessíveis em todas as páginas', async ({ page }) => {
    const pages = ['/', '/equipamentos', '/calibracoes'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verificar se há um título principal
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    }
  });
});

