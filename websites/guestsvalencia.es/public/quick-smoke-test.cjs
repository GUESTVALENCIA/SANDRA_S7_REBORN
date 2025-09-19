// quick-smoke-test.js
// SMOKE TEST RÁPIDO PARA VALIDACIÓN INMEDIATA

const { chromium } = require('playwright');

async function runQuickSmokeTest() {
  console.log('🚀 Ejecutando Smoke Test Rápido...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function addResult(name, passed, details = '') {
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name} ${details}`);
    } else {
      results.failed++;
      console.log(`❌ ${name} ${details}`);
    }
  }

  try {
    // Test 1: Página principal carga
    console.log('🔍 Test 1: Carga de página principal...');
    const response = await page.goto('https://guestsvalencia.es', { timeout: 15000 });
    addResult('Página principal carga', response.status() === 200, `(${response.status()})`);

    // Test 2: Navbar presente
    console.log('🔍 Test 2: Navbar fija...');
    const navbar = page.locator('.site-navbar');
    const navbarVisible = await navbar.isVisible();
    addResult('Navbar fija presente', navbarVisible);

    if (navbarVisible) {
      const position = await navbar.evaluate(el => getComputedStyle(el).position);
      addResult('Navbar posición fixed', position === 'fixed', `(${position})`);
    }

    // Test 3: Sandra widget script cargado
    console.log('🔍 Test 3: Sandra widget...');
    const sandraScript = page.locator('script[src*="sandra-widget-hybrid.js"]');
    const sandraScriptExists = await sandraScript.count() > 0;
    addResult('Sandra widget script', sandraScriptExists);

    // Esperar que el FAB se genere
    await page.waitForTimeout(2000);

    // Test 4: Sandra FAB creado dinámicamente
    const sandraFab = page.locator('#sandra-fab-hybrid');
    const fabExists = await sandraFab.count() > 0;
    addResult('Sandra FAB generado', fabExists);

    // Test 5: PWA Manifest
    console.log('🔍 Test 5: PWA Manifest...');
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestExists = await manifestLink.count() > 0;
    addResult('PWA Manifest link', manifestExists);

    // Test 6: Responsive design básico
    console.log('🔍 Test 6: Responsive design...');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(1000);

    const bodyOverflow = await page.evaluate(() => {
      return document.body.scrollWidth <= window.innerWidth;
    });
    addResult('Responsive móvil', bodyOverflow);

    // Test 7: HTTPS
    console.log('🔍 Test 7: Seguridad HTTPS...');
    const isHttps = page.url().startsWith('https://');
    addResult('HTTPS enforced', isHttps);

    // Test 8: Performance básico (TTI estimado)
    console.log('🔍 Test 8: Performance básico...');
    const performanceMetrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.fetchStart,
        loadComplete: nav.loadEventEnd - nav.fetchStart
      };
    });

    const ttiGood = performanceMetrics.domContentLoaded < 3000; // < 3s en test local
    addResult('TTI estimado OK', ttiGood, `(${Math.round(performanceMetrics.domContentLoaded)}ms)`);

  } catch (error) {
    addResult('Test execution', false, error.message);
  }

  await browser.close();

  // Reporte final
  console.log('\n📊 RESULTADOS SMOKE TEST RÁPIDO');
  console.log('================================');
  console.log(`✅ Pasados: ${results.passed}`);
  console.log(`❌ Fallidos: ${results.failed}`);

  const total = results.passed + results.failed;
  const percentage = Math.round((results.passed / total) * 100);
  console.log(`📈 Score: ${percentage}%`);

  if (percentage >= 85) {
    console.log('\n🎉 EXCELENTE! Ready para tests completos');
    return true;
  } else if (percentage >= 70) {
    console.log('\n⚠️ BUENO. Algunos issues menores');
    return true;
  } else {
    console.log('\n❌ CRÍTICO. Resolver issues antes de continuar');
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runQuickSmokeTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error ejecutando smoke test:', error);
      process.exit(1);
    });
}

module.exports = { runQuickSmokeTest };