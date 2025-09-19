// playwright.config.ts
// CONFIGURACIÓN PLAYWRIGHT PARA TESTING E2E Y CONTRACT

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directorio de tests
  testDir: './tests',

  // Timeout global para tests
  timeout: 30000,

  // Configuración de expects
  expect: {
    timeout: 10000
  },

  // Número de workers en paralelo
  workers: process.env.CI ? 2 : 4,

  // Reporter para resultados
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['line']
  ],

  // Configuración global
  use: {
    // Base URL para todos los tests
    baseURL: process.env.BASE_URL || 'https://guestsvalencia.es',

    // Timeout para acciones
    actionTimeout: 10000,

    // Timeout para navegación
    navigationTimeout: 15000,

    // Screenshots y videos en fallo
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Configuración del navegador
    viewport: { width: 1280, height: 720 },
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',

    // Headers adicionales
    extraHTTPHeaders: {
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
    }
  },

  // Configuración de proyectos/browsers
  projects: [
    // Smoke tests rápidos en Chrome
    {
      name: 'smoke-chrome',
      testMatch: /smoke-tests\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    },

    // Contract tests
    {
      name: 'contract-tests',
      testMatch: /api-contracts\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome']
      }
    },

    // Security tests
    {
      name: 'security-tests',
      testMatch: /security-validation\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Configuración específica para seguridad
        permissions: ['microphone'],
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (Security-Test) Playwright'
        }
      }
    },

    // Mobile testing - iOS Safari
    {
      name: 'mobile-safari',
      testMatch: /smoke-tests\.spec\.ts/,
      use: {
        ...devices['iPhone 12'],
        // Simular iOS Safari específicamente
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      }
    },

    // Mobile testing - Chrome Android
    {
      name: 'mobile-chrome',
      testMatch: /smoke-tests\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        permissions: ['microphone']
      }
    },

    // Desktop cross-browser
    {
      name: 'desktop-firefox',
      testMatch: /smoke-tests\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox']
      }
    },

    {
      name: 'desktop-safari',
      testMatch: /smoke-tests\.spec\.ts/,
      use: {
        ...devices['Desktop Safari']
      }
    },

    // Performance testing específico
    {
      name: 'performance',
      testMatch: /performance\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Simular condiciones de red más lentas
        launchOptions: {
          args: [
            '--enable-features=NetworkService',
            '--force-effective-connection-type=4g'
          ]
        }
      }
    }
  ],

  // Configuración del web server local (si se necesita)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },

  // Configuración global para todos los tests
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts'
});

// Configuración específica para CI
if (process.env.CI) {
  module.exports.workers = 2;
  module.exports.retries = 2;
  module.exports.reporter = [
    ['github'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ];
}