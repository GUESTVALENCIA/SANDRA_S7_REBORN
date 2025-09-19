// tests/global-setup.ts
// CONFIGURACIÓN GLOBAL PARA TODOS LOS TESTS

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global para QA_GUARD validation');

  // Crear un browser context para verificaciones previas
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Verificar que el sitio está accesible
    console.log('🔍 Verificando accesibilidad del sitio...');
    const response = await page.goto(config.projects[0].use?.baseURL || 'https://guestsvalencia.es');

    if (!response || response.status() !== 200) {
      throw new Error(`Sitio no accesible: ${response?.status()}`);
    }

    console.log('✅ Sitio accesible');

    // Verificar elementos críticos del smoke test
    console.log('🔍 Verificando elementos críticos...');

    // Navbar
    const navbar = page.locator('.site-navbar');
    if (!(await navbar.isVisible())) {
      console.log('⚠️ Warning: Navbar no encontrada');
    }

    // Sandra FAB
    const sandraFab = page.locator('#sandra-fab-hybrid');
    if (!(await sandraFab.isVisible())) {
      console.log('⚠️ Warning: Sandra FAB no encontrada');
    }

    // PWA Manifest
    const manifest = page.locator('link[rel="manifest"]');
    if (!(await manifest.isVisible())) {
      console.log('⚠️ Warning: PWA Manifest no encontrado');
    }

    console.log('✅ Verificaciones iniciales completadas');

    // Preparar datos de prueba si es necesario
    await setupTestData(page);

  } catch (error) {
    console.error('❌ Error en setup global:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function setupTestData(page: any) {
  // Limpiar localStorage/sessionStorage para tests limpios
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Configurar datos de prueba si es necesario
  await page.evaluate(() => {
    // Mock data para tests
    localStorage.setItem('test-mode', 'true');
    localStorage.setItem('test-start-time', Date.now().toString());
  });

  console.log('🧪 Datos de prueba configurados');
}

export default globalSetup;