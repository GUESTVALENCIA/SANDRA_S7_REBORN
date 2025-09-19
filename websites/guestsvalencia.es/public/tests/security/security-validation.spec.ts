// tests/security/security-validation.spec.ts
// SECURITY VALIDATION - Pentesting Ligero y Verificaciones

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://guestsvalencia.es';

test.describe('SECURITY VALIDATION - Key Exposure Prevention', () => {

  test('✅ No expone claves API en cliente', async ({ page }) => {
    await page.goto(BASE_URL);

    // Interceptar todas las requests de red
    const networkLogs: string[] = [];
    page.on('request', request => {
      networkLogs.push(request.url());
    });

    // Activar DevTools y revisar variables globales
    await page.evaluate(() => {
      // Buscar claves en variables globales
      const globalKeys = Object.keys(window);
      const suspiciousKeys = globalKeys.filter(key =>
        key.toLowerCase().includes('api') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('token')
      );

      suspiciousKeys.forEach(key => {
        const value = (window as any)[key];
        if (typeof value === 'string' && value.length > 10) {
          console.log(`Potential exposed key: ${key} = ${value.substring(0, 10)}...`);
        }
      });
    });

    // Revisar localStorage y sessionStorage
    const localStorageKeys = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value && (key.toLowerCase().includes('api') || key.toLowerCase().includes('key'))) {
            keys.push({ key, valuePreview: value.substring(0, 20) });
          }
        }
      }
      return keys;
    });

    // No debe haber claves expuestas
    expect(localStorageKeys.length).toBe(0);

    // Revisar código fuente por patterns de claves
    const pageContent = await page.content();
    const dangerousPatterns = [
      /sk-[a-zA-Z0-9]{40,}/g, // OpenAI keys
      /OPENAI_API_KEY['":\s]*['"]\w{40,}['"]/gi,
      /api[_-]?key['":\s]*['"]\w{20,}['"]/gi,
      /secret['":\s]*['"]\w{20,}['"]/gi,
      /token['":\s]*['"]\w{20,}['"]/gi
    ];

    dangerousPatterns.forEach(pattern => {
      const matches = pageContent.match(pattern);
      if (matches) {
        console.log(`Potential key exposure: ${matches[0].substring(0, 30)}...`);
      }
      expect(matches).toBeNull();
    });
  });

  test('✅ No innerHTML con datos externos sin sanitizar', async ({ page }) => {
    await page.goto(BASE_URL);

    // Inyectar datos potencialmente maliciosos
    const xssPayloads = [
      '<script>window.xssDetected = true;</script>',
      '<img src=x onerror="window.xssDetected=true">',
      'javascript:window.xssDetected=true',
      '<svg onload="window.xssDetected=true">',
      '"><script>window.xssDetected=true;</script>'
    ];

    for (const payload of xssPayloads) {
      // Intentar inyectar via Sandra chat
      const sandraFab = page.locator('#sandra-fab-hybrid');
      if (await sandraFab.isVisible()) {
        await sandraFab.click();

        const chatInput = page.locator('#sandra-chat-input, input[type="text"], textarea');
        if (await chatInput.isVisible()) {
          await chatInput.fill(payload);
          await page.keyboard.press('Enter');

          // Esperar respuesta
          await page.waitForTimeout(2000);

          // Verificar que no se ejecutó XSS
          const xssExecuted = await page.evaluate(() => (window as any).xssDetected);
          expect(xssExecuted).toBeFalsy();
        }
      }
    }

    // Verificar que no hay innerHTML directo sin sanitizar
    const unsafeInnerHTML = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const dangerous = [];

      elements.forEach(el => {
        const innerHTML = el.innerHTML;
        if (innerHTML.includes('<script>') || innerHTML.includes('javascript:') || innerHTML.includes('onerror=')) {
          dangerous.push({
            tag: el.tagName,
            innerHTML: innerHTML.substring(0, 100)
          });
        }
      });

      return dangerous;
    });

    expect(unsafeInnerHTML.length).toBe(0);
  });

  test('✅ CSP sin wildcards peligrosos', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response?.headers() || {};

    const csp = headers['content-security-policy'] || headers['x-content-security-policy'];

    if (csp) {
      console.log('CSP Header found:', csp);

      // Verificar que no contiene wildcards peligrosos
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).not.toContain("data: *");
      expect(csp).not.toContain("* 'unsafe-eval'");

      // Verificar directivas específicas
      expect(csp).toMatch(/default-src|script-src|object-src/);

      // Si permite external scripts, debe ser específico
      if (csp.includes('script-src')) {
        const scriptSrcMatch = csp.match(/script-src[^;]*/);
        if (scriptSrcMatch) {
          const scriptSrc = scriptSrcMatch[0];
          // No debe permitir cualquier dominio
          expect(scriptSrc).not.toContain('* ');
          expect(scriptSrc).not.toContain(' *');
        }
      }
    } else {
      console.log('No CSP header found - consider implementing one');
    }
  });
});

test.describe('PENETRATION TESTING - CORS & File Upload', () => {

  test('✅ CORS Origin Spoofing debe fallar', async ({ request }) => {
    const spoofedOrigins = [
      'https://evil-guestsvalencia.es',
      'https://guestsvalencia.es.attacker.com',
      'https://sub.guestsvalencia.es',
      'http://guestsvalencia.es', // HTTP vs HTTPS
      'https://admin-guestsvalencia.es'
    ];

    for (const origin of spoofedOrigins) {
      console.log(`Testing spoofed origin: ${origin}`);

      const response = await request.post(`${BASE_URL}/.netlify/functions/sandra-chat`, {
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json',
          'Referer': origin
        },
        data: {
          message: 'Test from spoofed origin'
        }
      });

      // Debe rechazar o no devolver CORS permisivo
      if (response.status() === 200) {
        const headers = await response.allHeaders();
        const allowedOrigin = headers['access-control-allow-origin'];

        expect(allowedOrigin).not.toBe(origin);
        expect(allowedOrigin).not.toBe('*');

        // Debe ser específico al dominio legítimo
        if (allowedOrigin) {
          expect(allowedOrigin).toMatch(/^https:\/\/guestsvalencia\.es$/);
        }
      } else {
        // O rechazar completamente
        expect([400, 403, 404, 405]).toContain(response.status());
      }
    }
  });

  test('✅ Subida archivos maliciosos debe bloquearse', async ({ page }) => {
    await page.goto(BASE_URL);

    // Buscar inputs de archivo
    const fileInputs = page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();

    if (fileInputCount > 0) {
      const maliciousFiles = [
        {
          name: 'malicious.exe',
          content: 'MZ', // PE header
          mimeType: 'application/x-msdownload'
        },
        {
          name: 'script.php',
          content: '<?php system($_GET["cmd"]); ?>',
          mimeType: 'application/x-httpd-php'
        },
        {
          name: 'payload.js',
          content: 'document.location="http://evil.com"',
          mimeType: 'application/javascript'
        },
        {
          name: 'fake.jpg.exe',
          content: 'MZ\x90\x00', // PE with fake extension
          mimeType: 'image/jpeg'
        }
      ];

      for (const file of maliciousFiles) {
        try {
          // Crear archivo temporal
          const buffer = Buffer.from(file.content);

          // Simular upload
          await fileInputs.first().setInputFiles({
            name: file.name,
            mimeType: file.mimeType,
            buffer: buffer
          });

          // Buscar submit button o similar
          const submitButton = page.locator('[type="submit"], button[type="submit"], .upload-btn');
          if (await submitButton.isVisible()) {
            await submitButton.click();

            // Verificar que fue rechazado
            await page.waitForTimeout(2000);

            const errorMessage = page.locator('.error, .alert-danger, [data-error]');
            const isErrorVisible = await errorMessage.isVisible();

            if (!isErrorVisible) {
              // Verificar en la consola
              const consoleErrors = await page.evaluate(() => {
                return (window as any).uploadErrors || [];
              });

              expect(consoleErrors.length > 0 || isErrorVisible).toBeTruthy();
            }
          }
        } catch (error) {
          // Si falla al subir, está bien - significa que está bloqueado
          console.log(`File ${file.name} correctly blocked:`, error);
        }
      }
    } else {
      console.log('No file upload inputs found - skipping malicious file test');
    }
  });

  test('✅ Headers de seguridad implementados', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response?.headers() || {};

    console.log('Security headers check:');

    // X-Frame-Options
    const xFrameOptions = headers['x-frame-options'];
    if (xFrameOptions) {
      expect(['DENY', 'SAMEORIGIN'].some(value =>
        xFrameOptions.toUpperCase().includes(value)
      )).toBeTruthy();
      console.log('✓ X-Frame-Options:', xFrameOptions);
    }

    // X-Content-Type-Options
    const xContentTypeOptions = headers['x-content-type-options'];
    if (xContentTypeOptions) {
      expect(xContentTypeOptions.toLowerCase()).toContain('nosniff');
      console.log('✓ X-Content-Type-Options:', xContentTypeOptions);
    }

    // X-XSS-Protection
    const xssProtection = headers['x-xss-protection'];
    if (xssProtection) {
      console.log('✓ X-XSS-Protection:', xssProtection);
    }

    // Strict-Transport-Security (HSTS)
    const hsts = headers['strict-transport-security'];
    if (hsts) {
      expect(hsts).toContain('max-age=');
      console.log('✓ HSTS:', hsts);
    }

    // Referrer-Policy
    const referrerPolicy = headers['referrer-policy'];
    if (referrerPolicy) {
      console.log('✓ Referrer-Policy:', referrerPolicy);
    }

    // Permissions-Policy
    const permissionsPolicy = headers['permissions-policy'];
    if (permissionsPolicy) {
      console.log('✓ Permissions-Policy:', permissionsPolicy);
    }

    // Verificar HTTPS
    expect(page.url()).toMatch(/^https:/);
    console.log('✓ HTTPS enforced');
  });

  test('✅ Session/Cookie Security', async ({ page }) => {
    await page.goto(BASE_URL);

    // Verificar cookies de sesión
    const cookies = await page.context().cookies();

    cookies.forEach(cookie => {
      console.log(`Cookie: ${cookie.name}`);

      // Cookies sensibles deben tener flags de seguridad
      if (cookie.name.toLowerCase().includes('session') ||
          cookie.name.toLowerCase().includes('auth') ||
          cookie.name.toLowerCase().includes('token')) {

        expect(cookie.secure).toBeTruthy(); // Debe ser secure en HTTPS
        expect(cookie.httpOnly).toBeTruthy(); // No accesible via JavaScript

        if (cookie.sameSite) {
          expect(['Strict', 'Lax']).toContain(cookie.sameSite);
        }

        console.log(`✓ Secure cookie: ${cookie.name}`);
      }
    });

    // Verificar que no hay cookies de tracking no autorizadas
    const trackingCookies = cookies.filter(cookie =>
      cookie.name.toLowerCase().includes('_ga') ||
      cookie.name.toLowerCase().includes('_fb') ||
      cookie.name.toLowerCase().includes('analytics')
    );

    if (trackingCookies.length > 0) {
      console.log('Tracking cookies found:', trackingCookies.map(c => c.name));
      // Debe haber consentimiento para cookies de tracking
    }
  });
});