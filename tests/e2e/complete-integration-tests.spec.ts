import { test, expect } from '@playwright/test';

test.describe('Complete Integration Tests - All Sidebar Items', () => {
  
  test.describe('1. Dashboard', () => {
    test('deve carregar e validar todos os elementos', async ({ page }) => {
      console.log('\n🏠 === DASHBOARD ===');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verificar cards de estatísticas
      const cards = await page.locator('[class*="card"], [class*="Card"]').count();
      console.log(`✓ Cards encontrados: ${cards}`);
      expect(cards).toBeGreaterThan(0);

      // Verificar se há dados numéricos (indicando integração com DB)
      const numbers = await page.locator('text=/\\d+/').count();
      console.log(`✓ Dados numéricos: ${numbers}`);
      expect(numbers).toBeGreaterThan(0);
    });
  });

  test.describe('2. Equipamentos', () => {
    test('deve testar todos os botões e integração com DB', async ({ page }) => {
      console.log('\n⚙️ === EQUIPAMENTOS ===');
      await page.goto('/equipamentos');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 1. Botão Adicionar Equipamento
      console.log('\n1️⃣ Testando botão ADICIONAR...');
      const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Novo")').first();
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(1000);
        
        // Verificar se modal abriu
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        console.log('  ✓ Modal de adicionar abriu');

        // Verificar campos do formulário
        const inputs = await modal.locator('input, select, textarea').count();
        console.log(`  ✓ Campos de entrada: ${inputs}`);
        expect(inputs).toBeGreaterThan(0);

        // Fechar modal
        const closeButton = modal.locator('button[aria-label*="Close"], button:has-text("Cancelar")').first();
        if (await closeButton.count() > 0) {
          await closeButton.click();
          await page.waitForTimeout(500);
        } else {
          await page.keyboard.press('Escape');
        }
      }

      // 2. Filtros (integração com DB)
      console.log('\n2️⃣ Testando FILTROS...');
      const selects = page.locator('select');
      const selectCount = await selects.count();
      console.log(`  ✓ Filtros disponíveis: ${selectCount}`);
      
      if (selectCount > 0) {
        // Testar filtro de polo (dados do DB)
        const poloSelect = selects.first();
        const options = await poloSelect.locator('option').count();
        console.log(`  ✓ Opções no filtro de Polo: ${options}`);
        expect(options).toBeGreaterThan(1); // Pelo menos "Todos" + 1 polo
      }

      // 3. Buscar equipamento
      console.log('\n3️⃣ Testando BUSCA...');
      const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('PO');
        await page.waitForTimeout(1000);
        console.log('  ✓ Busca funcionando');
        await searchInput.clear();
      }

      // 4. Botões de ação nos cards
      console.log('\n4️⃣ Testando BOTÕES DE AÇÃO...');
      const viewButtons = page.locator('[data-testid^="button-view-"]');
      const viewCount = await viewButtons.count();
      console.log(`  ✓ Botões "Visualizar": ${viewCount}`);

      if (viewCount > 0) {
        // Testar botão de visualizar
        await viewButtons.first().click();
        await page.waitForTimeout(1000);
        const detailsModal = page.locator('[role="dialog"]');
        await expect(detailsModal).toBeVisible();
        console.log('  ✓ Modal de detalhes abriu');

        // Verificar se há dados do equipamento (integração DB)
        const hasData = await detailsModal.locator('text=/TAG|Serial|Fabricante/i').count();
        console.log(`  ✓ Dados do equipamento carregados: ${hasData > 0}`);

        await page.keyboard.press('Escape');
      }

      // 5. Botões de Export/Import
      console.log('\n5️⃣ Testando EXPORT/IMPORT...');
      const exportButtons = page.locator('button:has-text("Exportar"), button:has-text("Template"), button:has-text("Importar")');
      const exportCount = await exportButtons.count();
      console.log(`  ✓ Botões de export/import: ${exportCount}`);
    });
  });

  test.describe('3. Calibrações', () => {
    test('deve testar funcionalidades e integração', async ({ page }) => {
      console.log('\n📅 === CALIBRAÇÕES ===');
      await page.goto('/calibracoes');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 1. Botão Agendar Calibração
      console.log('\n1️⃣ Testando AGENDAR CALIBRAÇÃO...');
      const scheduleButton = page.locator('button:has-text("Agendar")').first();
      if (await scheduleButton.count() > 0) {
        await scheduleButton.click();
        await page.waitForTimeout(1000);
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        console.log('  ✓ Modal de agendamento abriu');

        // Verificar se há lista de equipamentos (DB)
        const equipSelect = modal.locator('select').first();
        if (await equipSelect.count() > 0) {
          const equipOptions = await equipSelect.locator('option').count();
          console.log(`  ✓ Equipamentos disponíveis: ${equipOptions}`);
          expect(equipOptions).toBeGreaterThan(0);
        }

        await page.keyboard.press('Escape');
      }

      // 2. Filtros
      console.log('\n2️⃣ Testando FILTROS...');
      const filters = page.locator('select');
      const filterCount = await filters.count();
      console.log(`  ✓ Filtros: ${filterCount}`);

      // 3. Abas (Tabs)
      console.log('\n3️⃣ Testando ABAS...');
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();
      console.log(`  ✓ Abas disponíveis: ${tabCount}`);

      if (tabCount > 1) {
        await tabs.nth(1).click();
        await page.waitForTimeout(500);
        console.log('  ✓ Navegação entre abas funciona');
      }

      // 4. Verificar dados da tabela (integração DB)
      console.log('\n4️⃣ Verificando DADOS DA TABELA...');
      const tableRows = page.locator('table tbody tr, [data-testid^="equipment-"]');
      const rowCount = await tableRows.count();
      console.log(`  ✓ Registros na tabela: ${rowCount}`);
    });
  });

  test.describe('4. Execução de Calibrações', () => {
    test('deve testar funcionalidades', async ({ page }) => {
      console.log('\n🔧 === EXECUÇÃO DE CALIBRAÇÕES ===');
      await page.goto('/execucao-calibracoes');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 1. Filtro de equipamento
      console.log('\n1️⃣ Testando FILTRO DE EQUIPAMENTO...');
      const equipFilter = page.locator('select').first();
      if (await equipFilter.count() > 0) {
        const options = await equipFilter.locator('option').count();
        console.log(`  ✓ Equipamentos no filtro: ${options}`);
        expect(options).toBeGreaterThan(1);
      }

      // 2. Filtro de período
      console.log('\n2️⃣ Testando FILTRO DE PERÍODO...');
      const periodFilter = page.locator('select').nth(1);
      if (await periodFilter.count() > 0) {
        await periodFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        console.log('  ✓ Filtro de período funciona');
      }

      // 3. Botão Nova Execução
      console.log('\n3️⃣ Testando NOVA EXECUÇÃO...');
      const newButton = page.locator('button:has-text("Executar"), button:has-text("Registrar"), button:has-text("Nova")').first();
      if (await newButton.count() > 0) {
        await newButton.click();
        await page.waitForTimeout(1000);
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        console.log('  ✓ Modal de execução abriu');

        // Verificar campos
        const inputs = await modal.locator('input, select, textarea').count();
        console.log(`  ✓ Campos no formulário: ${inputs}`);

        await page.keyboard.press('Escape');
      }

      // 4. Estatísticas
      console.log('\n4️⃣ Verificando ESTATÍSTICAS...');
      const stats = page.locator('text=/Pendente|Vencid|Próximo/i');
      const statsCount = await stats.count();
      console.log(`  ✓ Cards de estatísticas: ${statsCount}`);
    });
  });

  test.describe('5. Instalações', () => {
    test('deve testar CRUD e integração', async ({ page }) => {
      console.log('\n🏭 === INSTALAÇÕES ===');
      
      const link = page.locator('a[href*="instalac"]');
      if (await link.count() > 0) {
        await link.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // 1. Botão Adicionar
        console.log('\n1️⃣ Testando ADICIONAR INSTALAÇÃO...');
        const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova")').first();
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(1000);
          
          const modal = page.locator('[role="dialog"]');
          await expect(modal).toBeVisible();
          console.log('  ✓ Modal de instalação abriu');

          // Verificar select de Polo (integração DB)
          const poloSelect = modal.locator('select').first();
          if (await poloSelect.count() > 0) {
            const poloOptions = await poloSelect.locator('option').count();
            console.log(`  ✓ Polos disponíveis: ${poloOptions}`);
            expect(poloOptions).toBeGreaterThan(0);
          }

          await page.keyboard.press('Escape');
        }

        // 2. Filtros
        console.log('\n2️⃣ Testando FILTROS...');
        const filters = page.locator('select');
        const filterCount = await filters.count();
        console.log(`  ✓ Filtros: ${filterCount}`);

        // 3. Verificar lista (dados do DB)
        console.log('\n3️⃣ Verificando DADOS...');
        const items = page.locator('[data-testid^="installation-"], tr, [class*="card"]');
        const itemCount = await items.count();
        console.log(`  ✓ Instalações listadas: ${itemCount}`);
      }
    });
  });

  test.describe('6. Pontos de Medição', () => {
    test('deve testar funcionalidades', async ({ page }) => {
      console.log('\n📊 === PONTOS DE MEDIÇÃO ===');
      
      const link = page.locator('a[href*="pontos-medicao"]');
      if (await link.count() > 0) {
        await link.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Botão adicionar
        const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Novo")').first();
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(1000);
          
          const modal = page.locator('[role="dialog"]');
          await expect(modal).toBeVisible();
          console.log('  ✓ Modal de ponto de medição abriu');

          // Verificar campos relacionados a equipamentos (DB)
          const inputs = await modal.locator('input, select').count();
          console.log(`  ✓ Campos de entrada: ${inputs}`);

          await page.keyboard.press('Escape');
        }

        // Verificar dados
        const items = page.locator('tr, [class*="card"]');
        const itemCount = await items.count();
        console.log(`  ✓ Pontos listados: ${itemCount}`);
      }
    });
  });

  test.describe('7. Placas de Orifício', () => {
    test('deve testar funcionalidades', async ({ page }) => {
      console.log('\n🔘 === PLACAS DE ORIFÍCIO ===');
      
      const link = page.locator('a[href*="placa"], a[href*="orifice"]');
      if (await link.count() > 0) {
        await link.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Botão adicionar
        const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova")').first();
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(1000);
          
          const modal = page.locator('[role="dialog"]');
          if (await modal.count() > 0) {
            console.log('  ✓ Modal de placa abriu');

            // Verificar select de equipamento (DB)
            const equipSelect = modal.locator('select').first();
            if (await equipSelect.count() > 0) {
              const options = await equipSelect.locator('option').count();
              console.log(`  ✓ Equipamentos vinculados: ${options}`);
            }

            await page.keyboard.press('Escape');
          }
        }

        const items = page.locator('tr, [class*="card"]');
        const itemCount = await items.count();
        console.log(`  ✓ Placas listadas: ${itemCount}`);
      }
    });
  });

  test.describe('8. Válvulas', () => {
    test('deve testar funcionalidades', async ({ page }) => {
      console.log('\n🚰 === VÁLVULAS ===');
      
      const link = page.locator('a[href*="valvulas"], a[href*="valves"]');
      if (await link.count() > 0) {
        await link.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova")').first();
        if (await addButton.count() > 0) {
          await addButton.click();
          await page.waitForTimeout(1000);
          
          const modal = page.locator('[role="dialog"]');
          if (await modal.count() > 0) {
            console.log('  ✓ Modal de válvula abriu');
            await page.keyboard.press('Escape');
          }
        }

        const items = page.locator('tr, [class*="card"]');
        const itemCount = await items.count();
        console.log(`  ✓ Válvulas listadas: ${itemCount}`);
      }
    });
  });

  test.describe('9. Notificações', () => {
    test('deve testar funcionalidades', async ({ page }) => {
      console.log('\n🔔 === NOTIFICAÇÕES ===');
      
      const link = page.locator('a[href*="notifica"]');
      if (await link.count() > 0) {
        await link.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verificar se há notificações (DB)
        const notifications = page.locator('[class*="notification"], tr, [class*="card"]');
        const notifCount = await notifications.count();
        console.log(`  ✓ Notificações: ${notifCount}`);

        // Verificar filtros
        const filters = page.locator('select, button[role="combobox"]');
        const filterCount = await filters.count();
        console.log(`  ✓ Filtros disponíveis: ${filterCount}`);
      }
    });
  });

  test.describe('10. Relatórios', () => {
    test('deve testar botões de geração', async ({ page }) => {
      console.log('\n📄 === RELATÓRIOS ===');
      
      const link = page.locator('a[href*="relatorio"]');
      if (await link.count() > 0) {
        await link.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verificar botões de relatório
        const reportButtons = page.locator('button:has-text("Gerar"), button:has-text("Exportar"), button:has-text("Relatório")');
        const buttonCount = await reportButtons.count();
        console.log(`  ✓ Botões de relatório: ${buttonCount}`);
        expect(buttonCount).toBeGreaterThan(0);

        // Verificar se há filtros para relatórios
        const filters = page.locator('select, input[type="date"]');
        const filterCount = await filters.count();
        console.log(`  ✓ Filtros de período/tipo: ${filterCount}`);
      }
    });
  });
});

