// tests/global-teardown.ts
// LIMPIEZA GLOBAL DESPUÉS DE TODOS LOS TESTS

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando teardown global después de QA_GUARD validation');

  try {
    // Generar reporte de métricas
    await generateMetricsReport();

    // Limpiar archivos temporales
    await cleanupTempFiles();

    console.log('✅ Teardown completado exitosamente');

  } catch (error) {
    console.error('❌ Error en teardown global:', error);
  }
}

async function generateMetricsReport() {
  console.log('📊 Generando reporte de métricas...');

  const reportData = {
    timestamp: new Date().toISOString(),
    testRun: {
      startTime: process.env.TEST_START_TIME || new Date().toISOString(),
      endTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      baseUrl: process.env.BASE_URL || 'https://guestsvalencia.es'
    },
    metrics: {
      // Estos serán poblados por los tests individuales
      performance: {},
      security: {},
      functionality: {}
    },
    status: 'completed'
  };

  // Crear directorio de reportes si no existe
  const reportsDir = path.join(process.cwd(), 'test-results', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Escribir reporte
  const reportPath = path.join(reportsDir, `qa-guard-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  console.log(`📄 Reporte generado: ${reportPath}`);
}

async function cleanupTempFiles() {
  console.log('🗑️ Limpiando archivos temporales...');

  const tempDirs = [
    path.join(process.cwd(), 'temp'),
    path.join(process.cwd(), '.temp'),
    path.join(process.cwd(), 'test-results', 'temp')
  ];

  for (const dir of tempDirs) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`🗑️ Eliminado: ${dir}`);
      } catch (error) {
        console.log(`⚠️ No se pudo eliminar ${dir}:`, error);
      }
    }
  }
}

export default globalTeardown;