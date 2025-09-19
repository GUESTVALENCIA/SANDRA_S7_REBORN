// lighthouse-ci.config.js
// CONFIGURACIÓN LIGHTHOUSE CI PARA PERFORMANCE METRICS

module.exports = {
  ci: {
    collect: {
      // URLs a analizar
      url: [
        'https://guestsvalencia.es',
        'https://guestsvalencia.es/alojamientos.html',
        'https://guestsvalencia.es/propietarios.html',
        'https://guestsvalencia.es/contacto.html'
      ],
      // Número de ejecuciones para promediar
      numberOfRuns: 3,
      // Configuración del navegador
      settings: {
        // Simular condición de red 4G lenta
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        },
        // Simular dispositivo móvil mid-tier
        emulatedFormFactor: 'mobile',
        // Configuración de viewport
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false
        },
        // Auditorías específicas a ejecutar
        onlyAudits: [
          'first-contentful-paint',
          'largest-contentful-paint',
          'interactive',
          'speed-index',
          'cumulative-layout-shift',
          'total-blocking-time',
          'server-response-time',
          'render-blocking-resources',
          'unused-css-rules',
          'unused-javascript',
          'modern-image-formats',
          'efficient-animated-content',
          'preload-lcp-image',
          'uses-responsive-images',
          'offscreen-images',
          'unminified-css',
          'unminified-javascript',
          'uses-text-compression',
          'font-display',
          'resource-summary'
        ],
        // Configuración adicional
        locale: 'es',
        disableStorageReset: false,
        clearStorageTypes: ['cookies', 'localstorage', 'sessionstorage', 'cache']
      }
    },
    assert: {
      // MÉTRICAS CRÍTICAS - DoD: TTI < 2s, Lighthouse ≥ 90
      assertions: {
        // Performance Score mínimo 90
        'categories:performance': ['error', { minScore: 0.9 }],

        // TTI < 2s (2000ms) - CRÍTICO
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'interactive': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],

        // Core Web Vitals
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],

        // Server performance
        'server-response-time': ['error', { maxNumericValue: 600 }],

        // Resource optimization
        'render-blocking-resources': ['warn', { maxLength: 3 }],
        'unused-css-rules': ['warn', { maxLength: 5 }],
        'unused-javascript': ['warn', { maxLength: 5 }],

        // Best practices
        'uses-responsive-images': ['warn', { maxLength: 3 }],
        'modern-image-formats': ['warn', { maxLength: 3 }],
        'font-display': ['warn', { maxLength: 0 }],

        // Accessibility mínima
        'categories:accessibility': ['warn', { minScore: 0.8 }],

        // SEO básico
        'categories:seo': ['warn', { minScore: 0.85 }],

        // Best practices
        'categories:best-practices': ['warn', { minScore: 0.85 }]
      }
    },
    upload: {
      // Configuración para CI/CD
      target: 'temporary-public-storage',
      // Solo en CI, subir a almacenamiento temporal
      uploadUrlMap: process.env.CI === 'true'
    },
    server: {
      // Puerto para servidor local si se necesita
      port: 9001,
      host: '0.0.0.0'
    }
  }
};

// Configuración específica para diferentes entornos
if (process.env.NODE_ENV === 'development') {
  // En desarrollo, métricas más relajadas
  module.exports.ci.assert.assertions = {
    'categories:performance': ['warn', { minScore: 0.7 }],
    'interactive': ['warn', { maxNumericValue: 3000 }],
    'first-contentful-paint': ['warn', { maxNumericValue: 2000 }]
  };
}

if (process.env.CI_ENVIRONMENT === 'staging') {
  // En staging, usar métricas intermedias
  module.exports.ci.assert.assertions['categories:performance'] = ['error', { minScore: 0.85 }];
  module.exports.ci.assert.assertions['interactive'] = ['error', { maxNumericValue: 2500 }];
}

// Configuración para Mobile vs Desktop
const isMobileTest = process.env.LIGHTHOUSE_DEVICE === 'mobile';
if (!isMobileTest) {
  // Desktop tiene métricas diferentes
  module.exports.ci.collect.settings.emulatedFormFactor = 'desktop';
  module.exports.ci.collect.settings.screenEmulation = {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false
  };

  // Desktop debe ser más rápido
  module.exports.ci.assert.assertions['interactive'] = ['error', { maxNumericValue: 1500 }];
  module.exports.ci.assert.assertions['first-contentful-paint'] = ['error', { maxNumericValue: 1000 }];
}

// Custom audits para validaciones específicas
module.exports.ci.collect.settings.auditMode = process.env.AUDIT_MODE || 'lighthouse';

// Budget para recursos críticos
module.exports.ci.collect.settings.budgets = [
  {
    path: '/*',
    timings: [
      {
        metric: 'interactive',
        budget: 2000, // 2s max TTI
        tolerance: 100 // +100ms tolerance
      },
      {
        metric: 'first-contentful-paint',
        budget: 1500, // 1.5s max FCP
        tolerance: 50
      }
    ],
    resourceSizes: [
      {
        resourceType: 'script',
        budget: 300, // 300KB max JS
      },
      {
        resourceType: 'stylesheet',
        budget: 100, // 100KB max CSS
      },
      {
        resourceType: 'image',
        budget: 500, // 500KB max images per page
      },
      {
        resourceType: 'total',
        budget: 1500, // 1.5MB total page weight
      }
    ],
    resourceCounts: [
      {
        resourceType: 'script',
        budget: 10, // Max 10 script files
      },
      {
        resourceType: 'stylesheet',
        budget: 5, // Max 5 CSS files
      },
      {
        resourceType: 'third-party',
        budget: 8, // Max 8 third-party requests
      }
    ]
  }
];

// Configuración de plugins específicos para Sandra IA
if (process.env.AUDIT_SANDRA === 'true') {
  // Auditorías específicas para funcionalidad de IA
  module.exports.ci.collect.settings.onlyAudits.push(
    'network-requests',
    'network-rtt',
    'network-server-latency',
    'main-thread-tasks',
    'third-party-summary'
  );

  // Budgets específicos para APIs de IA
  module.exports.ci.collect.settings.budgets[0].resourceCounts.push({
    resourceType: 'fetch',
    budget: 5 // Max 5 API calls durante load inicial
  });
}