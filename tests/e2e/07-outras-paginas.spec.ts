import { test, expect } from '@playwright/test';

test.describe('Outras Páginas do Sistema', () => {
  test('deve acessar página de instalações', async ({ page }) => {
    await page.goto('/');
    
    const instalacoesLink = page.locator('a[href*="instalac"]');
    if (await instalacoesLink.count() > 0) {
      await instalacoesLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveURL(/\/instalacoes/);
    }
  });

  test('deve acessar página de placas de orifício', async ({ page }) => {
    await page.goto('/');
    
    const placasLink = page.locator('a[href*="placa"], a[href*="orifice"]');
    if (await placasLink.count() > 0) {
      await placasLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveURL(/\/placas|\/orifice/);
    }
  });

  test('deve acessar página de notificações', async ({ page }) => {
    await page.goto('/');
    
    const notifLink = page.locator('a[href*="notifica"]');
    if (await notifLink.count() > 0) {
      await notifLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveURL(/\/notificacoes/);
    }
  });

  test('deve acessar página de relatórios', async ({ page }) => {
    await page.goto('/');
    
    const reportLink = page.locator('a[href*="relatorio"]');
    if (await reportLink.count() > 0) {
      await reportLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveURL(/\/relatorios/);
    }
  });

  test('deve acessar página de pontos de medição', async ({ page }) => {
    await page.goto('/');
    
    const pontosLink = page.locator('a[href*="pontos-medicao"]');
    if (await pontosLink.count() > 0) {
      await pontosLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveURL(/\/pontos-medicao/);
    }
  });

  test('deve acessar página de válvulas', async ({ page }) => {
    await page.goto('/');
    
    const valvulasLink = page.locator('a[href*="valvulas"], a[href*="valves"]');
    if (await valvulasLink.count() > 0) {
      await valvulasLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveURL(/\/valvulas|\/valves/);
    }
  });

  test('deve acessar página de análises químicas', async ({ page }) => {
    await page.goto('/');
    
    const quimicaLink = page.locator('a[href*="quimica"], a[href*="chemical"]');
    if (await quimicaLink.count() > 0) {
      await quimicaLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
  });
});

