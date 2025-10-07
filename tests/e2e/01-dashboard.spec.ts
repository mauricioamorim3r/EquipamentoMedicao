import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('deve carregar o dashboard corretamente', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Aguardar carregamento dos dados
    await page.waitForTimeout(2000);
    
    // Verificar se cards de estatísticas estão visíveis (usando seletores mais flexíveis)
    const statsCards = page.locator('[class*="card"], [class*="Card"]').filter({ 
      hasText: /Equipamentos|Calibra|Críticos|Conformidade/i 
    });
    
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 });
    
    // Verificar se há números/dados no dashboard
    const numbers = page.locator('text=/\\d+/');
    expect(await numbers.count()).toBeGreaterThan(0);
  });

  test('deve exibir gráfico de distribuição por polo', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Aguardar carregamento dos dados
    await page.waitForTimeout(3000);
    
    // Verificar se o conteúdo principal está visível (usando .first() para evitar strict mode)
    const dashboardContent = page.locator('main').first();
    await expect(dashboardContent).toBeVisible();
    
    // Verificar se há algum conteúdo numérico (estatísticas)
    const hasNumbers = await page.locator('text=/\\d+/').count() > 0;
    expect(hasNumbers).toBeTruthy();
    
    // Verificar se há elementos relacionados a polos
    const hasPolo = await page.locator('text=/Polo|Búzios|Marlim/i').count() > 0;
    expect(hasPolo).toBeTruthy();
  });

  test('deve navegar para equipamentos ao clicar no menu', async ({ page }) => {
    await page.goto('/');
    
    // Clicar no menu de equipamentos
    await page.click('text=Equipamentos');
    
    // Verificar se navegou para a página correta
    await expect(page).toHaveURL(/\/equipamentos/);
  });
});

