// tests/e2e/performance.spec.ts
// PERFORMANCE TESTING - TTI < 2s, Audio Latency, Core Web Vitals

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://guestsvalencia.es';
const TTI_TARGET = 2000; // 2s
const AUDIO_TTFT_TARGET = 700; // 700ms
const AUDIO_E2E_TARGET = 900; // 900ms

test.describe('PERFORMANCE METRICS - TTI & Audio Latency', () => {

  test('✅ TTI < 2s (Time To Interactive)', async ({ page }) => {
    console.log('📊 Midiendo Time To Interactive...');

    const startTime = Date.now();

    // Navegar y medir TTI
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    // Medir tiempo hasta que la página es completamente interactiva
    const tti = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            resolve(performance.now());
          });
        } else {
          setTimeout(() => {
            resolve(performance.now());
          }, 100);
        }
      });
    });

    const ttiMs = Math.round(tti);
    console.log(`TTI: ${ttiMs}ms`);

    // Verificar TTI < 2s
    expect(ttiMs).toBeLessThan(TTI_TARGET);

    // Medir métricas adicionales de Performance API
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
        tcp: Math.round(navigation.connectEnd - navigation.connectStart),
        ssl: navigation.secureConnectionStart ? Math.round(navigation.connectEnd - navigation.secureConnectionStart) : 0,
        ttfb: Math.round(navigation.responseStart - navigation.fetchStart),
        responseTime: Math.round(navigation.responseEnd - navigation.responseStart)
      };
    });

    console.log('📊 Performance Metrics:', metrics);

    // Validaciones adicionales
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // FCP < 1.5s
    expect(metrics.ttfb).toBeLessThan(800); // TTFB < 800ms
    expect(metrics.domContentLoaded).toBeLessThan(1500); // DOM ready < 1.5s
  });

  test('✅ Core Web Vitals Validation', async ({ page }) => {
    console.log('📊 Midiendo Core Web Vitals...');

    await page.goto(BASE_URL);

    // Simular interacción del usuario para CLS
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);
    await page.waitForTimeout(1000);

    const webVitals = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        const vitals = {
          cls: 0,
          fid: 0,
          lcp: 0,
          fcp: 0,
          ttfb: 0
        };

        // Obtener FCP
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          vitals.fcp = fcpEntry.startTime;
        }

        // Obtener TTFB
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navEntry) {
          vitals.ttfb = navEntry.responseStart - navEntry.fetchStart;
        }

        // Observer para LCP
        if ('PerformanceObserver' in window) {
          let lcpObserver: PerformanceObserver;
          let clsObserver: PerformanceObserver;
          let fidObserver: PerformanceObserver;

          try {
            // LCP Observer
            lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              vitals.lcp = lastEntry.startTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // CLS Observer
            clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  vitals.cls += (entry as any).value;
                }
              }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            // FID Observer
            fidObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                vitals.fid = (entry as any).processingStart - entry.startTime;
              }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

          } catch (e) {
            console.log('Observer error:', e);
          }

          // Resolver después de un tiempo
          setTimeout(() => {
            try {
              lcpObserver?.disconnect();
              clsObserver?.disconnect();
              fidObserver?.disconnect();
            } catch (e) {}
            resolve(vitals);
          }, 3000);
        } else {
          resolve(vitals);
        }
      });
    });

    console.log('📊 Core Web Vitals:', webVitals);

    // Validaciones Core Web Vitals
    if (webVitals.lcp > 0) {
      expect(webVitals.lcp).toBeLessThan(2500); // LCP < 2.5s
    }
    if (webVitals.fcp > 0) {
      expect(webVitals.fcp).toBeLessThan(1800); // FCP < 1.8s
    }
    if (webVitals.cls > 0) {
      expect(webVitals.cls).toBeLessThan(0.1); // CLS < 0.1
    }
    if (webVitals.fid > 0) {
      expect(webVitals.fid).toBeLessThan(100); // FID < 100ms
    }
    expect(webVitals.ttfb).toBeLessThan(800); // TTFB < 800ms
  });

  test('✅ Audio TTFT < 700ms Performance', async ({ page }) => {
    console.log('🎵 Midiendo Audio TTFT (Time To First Token)...');

    await page.goto(BASE_URL);

    // Esperar que Sandra FAB esté disponible
    const sandraFab = page.locator('#sandra-fab-hybrid');
    await expect(sandraFab).toBeVisible();

    const startTime = Date.now();

    // Iniciar interacción con Sandra
    await sandraFab.click();

    // Esperar que el widget se abra
    await page.waitForSelector('#sandra-widget.open', { timeout: 5000 });

    // Simular input de audio/texto
    const chatInput = page.locator('#sandra-chat-input, input[type="text"], textarea');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Hola Sandra, ¿cómo estás?');

      const audioStartTime = Date.now();

      // Simular envío
      await page.keyboard.press('Enter');

      // Esperar respuesta de audio (primer token)
      await page.waitForSelector('[data-audio-playing="true"], .audio-response, .sandra-speaking', {
        timeout: AUDIO_TTFT_TARGET + 500
      });

      const audioTTFT = Date.now() - audioStartTime;

      console.log(`🎵 Audio TTFT: ${audioTTFT}ms`);

      // Validación crítica: TTFT < 700ms
      expect(audioTTFT).toBeLessThan(AUDIO_TTFT_TARGET);

      // Medir E2E completo
      const e2eLatency = Date.now() - startTime;
      console.log(`🎵 Audio E2E: ${e2eLatency}ms`);

      // Validación crítica: E2E < 900ms
      expect(e2eLatency).toBeLessThan(AUDIO_E2E_TARGET);
    } else {
      console.log('⚠️ Chat input no encontrado, saltando test de audio');
      test.skip();
    }
  });

  test('✅ Resource Loading Performance', async ({ page }) => {
    console.log('📦 Analizando performance de recursos...');

    await page.goto(BASE_URL);

    // Analizar todos los recursos cargados
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      const analysis = {
        total: resources.length,
        byType: {} as Record<string, number>,
        slowest: [] as Array<{name: string, duration: number, size: number}>,
        totalSize: 0,
        totalDuration: 0
      };

      resources.forEach(resource => {
        const duration = resource.responseEnd - resource.startTime;
        const size = resource.transferSize || 0;

        // Contar por tipo
        const type = resource.name.split('.').pop()?.toLowerCase() || 'other';
        analysis.byType[type] = (analysis.byType[type] || 0) + 1;

        // Acumular métricas
        analysis.totalSize += size;
        analysis.totalDuration += duration;

        // Recursos más lentos
        analysis.slowest.push({
          name: resource.name,
          duration: Math.round(duration),
          size: size
        });
      });

      // Ordenar por duración y tomar los 5 más lentos
      analysis.slowest = analysis.slowest
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);

      return analysis;
    });

    console.log('📦 Resource Analysis:', resourceMetrics);

    // Validaciones de performance
    expect(resourceMetrics.total).toBeLessThan(50); // < 50 recursos por página
    expect(resourceMetrics.totalSize).toBeLessThan(2 * 1024 * 1024); // < 2MB total

    // Verificar que no hay recursos excesivamente lentos
    const slowestResource = resourceMetrics.slowest[0];
    if (slowestResource) {
      console.log(`🐌 Recurso más lento: ${slowestResource.name} (${slowestResource.duration}ms)`);
      expect(slowestResource.duration).toBeLessThan(3000); // < 3s para cualquier recurso
    }

    // Verificar distribución de tipos de archivo
    const scriptCount = resourceMetrics.byType['js'] || 0;
    const styleCount = resourceMetrics.byType['css'] || 0;

    expect(scriptCount).toBeLessThan(15); // < 15 archivos JS
    expect(styleCount).toBeLessThan(8); // < 8 archivos CSS
  });

  test('✅ Network Conditions Simulation', async ({ page, browserName }) => {
    console.log('🌐 Simulando condiciones de red lentas...');

    // Simular 4G lento
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 150 // 150ms RTT
    });

    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log(`🌐 Load time en 4G lento: ${loadTime}ms`);

    // En condiciones lentas, debe seguir siendo usable
    expect(loadTime).toBeLessThan(5000); // < 5s en 4G lento

    // Verificar que elementos críticos siguen funcionando
    const navbar = page.locator('.site-navbar');
    await expect(navbar).toBeVisible();

    const sandraFab = page.locator('#sandra-fab-hybrid');
    await expect(sandraFab).toBeVisible();
  });
});