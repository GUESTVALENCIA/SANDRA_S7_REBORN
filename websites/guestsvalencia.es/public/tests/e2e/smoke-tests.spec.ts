// tests/e2e/smoke-tests.spec.ts
// SMOKE TESTS CRÍTICOS PARA VALIDACIÓN POST-RESTAURACIÓN

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://guestsvalencia.es';
const AUDIO_TIMEOUT = 2000; // 2s para audio
const SHIMMER_INTERVAL = 15000; // 15s para shimmer

test.describe('SMOKE TESTS - UI Core Validation', () => {

  test('✅ Navbar fija en todas las secciones', async ({ page }) => {
    // Test navbar visibility on main page
    await page.goto(BASE_URL);

    // Verificar navbar existe y es fija
    const navbar = page.locator('.site-navbar');
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveCSS('position', 'fixed');
    await expect(navbar).toHaveCSS('top', '0px');

    // Scroll down y verificar que navbar permanece
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(navbar).toBeVisible();

    // Test en múltiples secciones
    const sections = ['/alojamientos.html', '/propietarios.html', '/contacto.html'];

    for (const section of sections) {
      await page.goto(BASE_URL + section);
      await expect(navbar).toBeVisible();
      await expect(navbar).toHaveCSS('position', 'fixed');
    }
  });

  test('✅ Slot IA bajo la barra de búsqueda', async ({ page }) => {
    await page.goto(BASE_URL);

    // Buscar el slot de IA (Sandra widget)
    const sandraFab = page.locator('#sandra-fab-hybrid');
    await expect(sandraFab).toBeVisible();

    // Verificar posición fija en bottom-right
    await expect(sandraFab).toHaveCSS('position', 'fixed');
    await expect(sandraFab).toHaveCSS('right', '16px');
    await expect(sandraFab).toHaveCSS('bottom', '80px');

    // Verificar color Sandra
    await expect(sandraFab).toHaveCSS('background-color', 'rgb(25, 195, 125)');
  });

  test('✅ Shimmer cada 15s en "Buscar con IA"', async ({ page }) => {
    await page.goto(BASE_URL);

    // Localizar elemento con animación shimmer
    const shimmerElement = page.locator('[data-testid="search-shimmer"], .shimmer-animation, .animate-pulse');

    if (await shimmerElement.isVisible()) {
      // Verificar que la animación se ejecuta
      const initialState = await shimmerElement.getAttribute('class');

      // Esperar 15 segundos para verificar el ciclo
      await page.waitForTimeout(SHIMMER_INTERVAL);

      const finalState = await shimmerElement.getAttribute('class');

      // Verificar que la animación sigue activa
      expect(finalState).toContain('animate');
    }
  });

  test('✅ No rutas legacy visibles (redirects a /)', async ({ page }) => {
    const legacyRoutes = [
      '/old-index.html',
      '/legacy/',
      '/admin/',
      '/dashboard/',
      '/api/',
      '/functions/'
    ];

    for (const route of legacyRoutes) {
      const response = await page.goto(BASE_URL + route, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      // Verificar que se redirige a home o devuelve 404
      const currentUrl = page.url();
      const statusCode = response?.status();

      expect(
        currentUrl === BASE_URL + '/' ||
        currentUrl === BASE_URL ||
        statusCode === 404 ||
        statusCode === 301 ||
        statusCode === 302
      ).toBeTruthy();
    }
  });
});

test.describe('AUDIO E2E - Performance & Compatibility', () => {

  test('✅ TTFT < 700ms (Time To First Token)', async ({ page, browserName }) => {
    // Simular interacción que triggera audio
    await page.goto(BASE_URL);

    const startTime = Date.now();

    // Click en Sandra FAB para iniciar conversación
    const sandraFab = page.locator('#sandra-fab-hybrid');
    await sandraFab.click();

    // Esperar respuesta de audio/TTS
    await page.waitForSelector('[data-audio-playing="true"], audio[playing], .audio-playing', {
      timeout: AUDIO_TIMEOUT
    });

    const endTime = Date.now();
    const ttft = endTime - startTime;

    console.log(`TTFT for ${browserName}: ${ttft}ms`);
    expect(ttft).toBeLessThan(700); // < 700ms requirement
  });

  test('✅ E2E < 900ms total latency', async ({ page }) => {
    await page.goto(BASE_URL);

    const startTime = Date.now();

    // Simular flujo completo: click → audio request → respuesta
    const sandraFab = page.locator('#sandra-fab-hybrid');
    await sandraFab.click();

    // Esperar widget abierto
    await page.waitForSelector('#sandra-widget.open');

    // Simular entrada de voz/texto
    const chatInput = page.locator('#sandra-chat-input, [data-testid="chat-input"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Hola Sandra');
      await page.keyboard.press('Enter');
    }

    // Esperar respuesta completa
    await page.waitForSelector('.sandra-message, [data-testid="sandra-response"]', {
      timeout: AUDIO_TIMEOUT
    });

    const endTime = Date.now();
    const e2eLatency = endTime - startTime;

    console.log(`E2E Latency: ${e2eLatency}ms`);
    expect(e2eLatency).toBeLessThan(900); // < 900ms requirement
  });

  test('✅ iOS Safari: opener flamenco OK', async ({ page, browserName }) => {
    // Solo ejecutar en Safari o WebKit
    if (!browserName.includes('webkit') && !browserName.includes('safari')) {
      test.skip();
    }

    await page.goto(BASE_URL);

    // Verificar que el audio opener existe
    const openerAudio = page.locator('audio[data-opener="true"], [data-testid="opener-audio"]');

    if (await openerAudio.isVisible()) {
      // Simular primera interacción (tap/scroll) para activar autoplay
      await page.tap('body');

      // Verificar que el audio se reproduce
      const audioElement = await openerAudio.elementHandle();
      const isPlaying = await audioElement?.evaluate((audio: HTMLAudioElement) => {
        return !audio.paused && !audio.ended && audio.currentTime > 0;
      });

      expect(isPlaying).toBeTruthy();
    }
  });

  test('✅ iOS Safari: autoplay/gesture funcionando', async ({ page, browserName }) => {
    if (!browserName.includes('webkit')) {
      test.skip();
    }

    await page.goto(BASE_URL);

    // Test autoplay policy compliance
    const audioElements = page.locator('audio');
    const audioCount = await audioElements.count();

    for (let i = 0; i < audioCount; i++) {
      const audio = audioElements.nth(i);
      const hasAutoplay = await audio.getAttribute('autoplay');

      if (hasAutoplay) {
        // Verificar que requiere gesture
        const canPlayPromise = audio.evaluate((el: HTMLAudioElement) => {
          return el.play().catch(e => e.name);
        });

        // Antes del gesture, debe fallar
        const beforeGesture = await canPlayPromise;
        expect(beforeGesture).toContain('NotAllowedError');

        // Después del gesture, debe funcionar
        await page.tap('body');
        const afterGesture = await audio.evaluate((el: HTMLAudioElement) => {
          return el.play().then(() => 'success').catch(e => e.name);
        });

        expect(afterGesture).toBe('success');
      }
    }
  });

  test('✅ Chrome Android: audio permissions OK', async ({ page, browserName }) => {
    if (!browserName.includes('chromium')) {
      test.skip();
    }

    // Simular permisos de Android
    await page.context().grantPermissions(['microphone']);

    await page.goto(BASE_URL);

    // Test acceso al micrófono para voice input
    const micButton = page.locator('[data-testid="mic-button"], .voice-input-btn');

    if (await micButton.isVisible()) {
      await micButton.click();

      // Verificar que no hay errores de permisos
      const permissionDenied = page.locator('.permission-denied, [data-error="microphone"]');
      await expect(permissionDenied).not.toBeVisible();
    }
  });
});

test.describe('CROSS-PLATFORM COMPATIBILITY', () => {

  test('✅ PWA instalación correcta', async ({ page }) => {
    await page.goto(BASE_URL);

    // Verificar manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeVisible();

    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();

    // Verificar service worker
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(swRegistered).toBeTruthy();

    // Verificar meta tags PWA
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toBeVisible();

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeVisible();
  });

  test('✅ Responsive design funcional', async ({ page }) => {
    await page.goto(BASE_URL);

    // Test en diferentes viewports
    const viewports = [
      { width: 375, height: 667 },  // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 } // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Verificar que navbar es responsive
      const navbar = page.locator('.site-navbar');
      await expect(navbar).toBeVisible();

      // Verificar que Sandra FAB se mantiene visible
      const sandraFab = page.locator('#sandra-fab-hybrid');
      await expect(sandraFab).toBeVisible();

      // Verificar que no hay overflow horizontal
      const bodyOverflow = await page.evaluate(() => {
        return document.body.scrollWidth <= window.innerWidth;
      });

      expect(bodyOverflow).toBeTruthy();
    }
  });
});