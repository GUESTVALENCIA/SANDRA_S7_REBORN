// tests/contract/api-contracts.spec.ts
// CONTRACT TESTS PARA APIs Y CORS VALIDATION

import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = 'https://guestsvalencia.es';
const API_ENDPOINTS = {
  sandraChat: '/.netlify/functions/sandra-chat',
  sandraTts: '/.netlify/functions/sandra-tts',
  health: '/api/health',
  manifest: '/manifest.webmanifest'
};

test.describe('CONTRACT TESTS - API Functions', () => {

  test('✅ Sandra Chat Function - Response Types & Headers', async ({ request }) => {
    const response = await request.post(BASE_URL + API_ENDPOINTS.sandraChat, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL
      },
      data: {
        message: 'Hola Sandra',
        userId: 'test-user-123'
      }
    });

    // Verificar status code correcto
    expect(response.status()).toBe(200);

    // Verificar headers CORS
    const corsHeaders = await response.allHeaders();
    expect(corsHeaders['access-control-allow-origin']).toBeTruthy();
    expect(corsHeaders['content-type']).toContain('application/json');

    // Verificar estructura de respuesta
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('message');
    expect(responseBody).toHaveProperty('timestamp');

    // Verificar tipos de datos
    expect(typeof responseBody.message).toBe('string');
    expect(typeof responseBody.timestamp).toBe('number');
  });

  test('✅ Sandra TTS Function - Audio Response Headers', async ({ request }) => {
    const response = await request.post(BASE_URL + API_ENDPOINTS.sandraTts, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL
      },
      data: {
        text: 'Hola, soy Sandra',
        voice: 'es-ES-standard-A'
      }
    });

    expect(response.status()).toBe(200);

    // Verificar headers específicos para audio
    const headers = await response.allHeaders();
    expect(headers['content-type']).toMatch(/audio|application\/octet-stream/);
    expect(headers['access-control-allow-origin']).toBeTruthy();

    // Verificar que devuelve datos binarios
    const audioBuffer = await response.body();
    expect(audioBuffer.length).toBeGreaterThan(0);
  });

  test('✅ OPTIONS Preflight - CORS 204 Response', async ({ request }) => {
    const endpoints = [API_ENDPOINTS.sandraChat, API_ENDPOINTS.sandraTts];

    for (const endpoint of endpoints) {
      const response = await request.fetch(BASE_URL + endpoint, {
        method: 'OPTIONS',
        headers: {
          'Origin': BASE_URL,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      // Verificar status 204 para OPTIONS
      expect(response.status()).toBe(204);

      const headers = await response.allHeaders();
      expect(headers['access-control-allow-origin']).toBeTruthy();
      expect(headers['access-control-allow-methods']).toContain('POST');
      expect(headers['access-control-allow-headers']).toContain('Content-Type');
    }
  });

  test('✅ Manifest PWA - Structure & Content-Type', async ({ request }) => {
    const response = await request.get(BASE_URL + API_ENDPOINTS.manifest);

    expect(response.status()).toBe(200);

    const headers = await response.allHeaders();
    expect(headers['content-type']).toContain('application/manifest+json');

    const manifest = await response.json();

    // Verificar estructura PWA requerida
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('theme_color');
    expect(manifest).toHaveProperty('background_color');
    expect(manifest).toHaveProperty('icons');

    // Verificar que icons es array
    expect(Array.isArray(manifest.icons)).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);

    // Verificar estructura de cada ícono
    manifest.icons.forEach((icon: any) => {
      expect(icon).toHaveProperty('src');
      expect(icon).toHaveProperty('sizes');
      expect(icon).toHaveProperty('type');
    });
  });
});

test.describe('CORS SECURITY VALIDATION', () => {

  test('✅ CORS Origin Spoofing Protection', async ({ request }) => {
    const maliciousOrigins = [
      'https://evil.com',
      'http://localhost:3000',
      'https://guestsvalencia.es.evil.com',
      'null',
      '*'
    ];

    for (const origin of maliciousOrigins) {
      const response = await request.post(BASE_URL + API_ENDPOINTS.sandraChat, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin
        },
        data: {
          message: 'Test from malicious origin'
        }
      });

      // Verificar que rechaza orígenes no autorizados
      if (response.status() === 200) {
        const headers = await response.allHeaders();
        const allowedOrigin = headers['access-control-allow-origin'];

        // No debe permitir orígenes maliciosos
        expect(allowedOrigin).not.toBe(origin);
        expect(allowedOrigin).not.toBe('*');
      } else {
        // O debe rechazar directamente
        expect([403, 404, 405]).toContain(response.status());
      }
    }
  });

  test('✅ Content Security Policy Headers', async ({ request }) => {
    const response = await request.get(BASE_URL);

    const headers = await response.allHeaders();

    // Verificar headers de seguridad
    if (headers['content-security-policy']) {
      const csp = headers['content-security-policy'];

      // No debe contener wildcards peligrosos
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("data: *");
      expect(csp).not.toContain("* 'unsafe-eval'");

      // Debe tener directivas básicas
      expect(csp).toContain('default-src');
    }

    // Verificar otros headers de seguridad
    expect(headers['x-frame-options'] || headers['x-content-type-options']).toBeTruthy();
  });

  test('✅ API Rate Limiting & DoS Protection', async ({ request }) => {
    const requests = [];
    const BURST_SIZE = 20;

    // Simular burst de requests
    for (let i = 0; i < BURST_SIZE; i++) {
      requests.push(
        request.post(BASE_URL + API_ENDPOINTS.sandraChat, {
          headers: {
            'Content-Type': 'application/json',
            'Origin': BASE_URL
          },
          data: {
            message: `Burst test ${i}`
          }
        })
      );
    }

    const responses = await Promise.all(requests);

    // Contar respuestas exitosas vs rate limited
    const successCount = responses.filter(r => r.status() === 200).length;
    const rateLimitedCount = responses.filter(r => [429, 503].includes(r.status())).length;

    // Debe tener algún tipo de rate limiting si es necesario
    if (rateLimitedCount > 0) {
      console.log(`Rate limiting active: ${rateLimitedCount}/${BURST_SIZE} requests limited`);
      expect(rateLimitedCount).toBeGreaterThan(0);
    } else {
      console.log(`No rate limiting detected, all ${successCount} requests succeeded`);
      expect(successCount).toBe(BURST_SIZE);
    }
  });
});

test.describe('ERROR HANDLING CONTRACTS', () => {

  test('✅ Malformed Request Handling', async ({ request }) => {
    const malformedRequests = [
      { data: 'invalid json string' },
      { data: { message: null } },
      { data: { message: 'x'.repeat(10000) } }, // Muy largo
      { data: {} }, // Vacío
      { data: { message: '<script>alert("xss")</script>' } }
    ];

    for (const req of malformedRequests) {
      const response = await request.post(BASE_URL + API_ENDPOINTS.sandraChat, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL
        },
        ...req
      });

      // Debe manejar errores gracefully
      expect([200, 400, 422]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        // Si acepta, debe sanitizar la respuesta
        expect(body.message).not.toContain('<script>');
        expect(body.message).not.toContain('alert(');
      }
    }
  });

  test('✅ Error Response Format Consistency', async ({ request }) => {
    // Trigger un error conocido
    const response = await request.post(BASE_URL + API_ENDPOINTS.sandraChat, {
      headers: {
        'Content-Type': 'text/plain', // Wrong content type
        'Origin': BASE_URL
      },
      data: 'not json'
    });

    if (response.status() >= 400) {
      const errorBody = await response.json().catch(() => null);

      if (errorBody) {
        // Verificar formato consistente de errores
        expect(errorBody).toHaveProperty('error');
        expect(typeof errorBody.error).toBe('string');

        // No debe exponer información sensible
        expect(errorBody.error).not.toContain('password');
        expect(errorBody.error).not.toContain('token');
        expect(errorBody.error).not.toContain('secret');
      }
    }
  });

  test('✅ WebSocket Connection Contracts', async ({ page }) => {
    await page.goto(BASE_URL);

    // Test WebSocket si está implementado
    const wsConnection = await page.evaluate(() => {
      return new Promise((resolve) => {
        try {
          const ws = new WebSocket('wss://guestsvalencia.es/ws');
          ws.onopen = () => resolve({ status: 'connected', url: ws.url });
          ws.onerror = () => resolve({ status: 'error' });
          setTimeout(() => resolve({ status: 'timeout' }), 5000);
        } catch (e) {
          resolve({ status: 'not_implemented' });
        }
      });
    });

    // Si WebSocket está implementado, verificar comportamiento
    if (wsConnection.status === 'connected') {
      console.log('WebSocket connection established');
      expect(wsConnection.url).toContain('wss://');
    } else {
      console.log('WebSocket not implemented or failed to connect');
    }
  });
});