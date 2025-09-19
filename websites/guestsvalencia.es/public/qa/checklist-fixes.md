# QA_GUARD - Checklist de Fixes Críticos

## 🚨 ISSUES CRÍTICOS DETECTADOS

### ❌ 1. Elementos UI Faltantes en index.html
- [ ] **Navbar fija** (site-navbar class)
- [ ] **Sandra FAB** (sandra-fab-hybrid ID)
- [ ] **Body content completo** (archivo truncado)

### ❌ 2. Archivos ausentes en producción
- [ ] **manifest.webmanifest** (404 en sitio)
- [ ] **alojamientos.html** (404 en sitio)
- [ ] **Posibles assets faltantes**

### ❌ 3. Shimmer animation
- [ ] **CSS shimmer** para "Buscar con IA"
- [ ] **Trigger cada 15s** en elementos search

### ❌ 4. Audio opener flamenco
- [ ] **Archivo audio** opener-flamenco.mp3
- [ ] **Trigger primera interacción** iOS

---

## ✅ PLAN DE RESOLUCIÓN INMEDIATA

### Paso 1: Restaurar index.html completo
```bash
# Comparar diferencias
diff index.html index.html.backup

# Restaurar elementos faltantes del backup
cp index.html.backup index.html
```

### Paso 2: Verificar deployment
```bash
# Verificar qué archivos están en producción
curl -I https://guestsvalencia.es/manifest.webmanifest
curl -I https://guestsvalencia.es/alojamientos.html
```

### Paso 3: Implementar shimmer
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.search-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 1000px 100%;
  animation: shimmer 15s ease-in-out infinite;
}
```

### Paso 4: Crear opener audio
```javascript
// Opener flamenco para iOS
const createAudioOpener = () => {
  const audio = new Audio('/assets/audio/opener-flamenco.mp3');
  audio.volume = 0.3;

  // Trigger en primera interacción
  document.addEventListener('touchstart', () => {
    audio.play().catch(console.log);
  }, { once: true });
};
```

---

## 🎯 VALIDACIÓN POST-FIX

### Tests a ejecutar después de fixes:
1. `./validate-qa-guard.sh` - Debe estar ≥90%
2. `npm run test:smoke` - Smoke tests deben pasar
3. `npm run lighthouse` - Score ≥90 performance

### Métricas target:
- **Calidad general:** ≥95%
- **Tests pasados:** 17/19 mínimo
- **Performance:** TTI < 2s
- **Audio TTFT:** < 700ms

---

## 📋 ORDEN DE EJECUCIÓN

1. **INMEDIATO** (15 min)
   - Restaurar index.html completo
   - Verificar deployment Netlify
   - Re-ejecutar validación

2. **CORTO PLAZO** (30 min)
   - Implementar shimmer CSS
   - Crear opener audio
   - Tests smoke locales

3. **VALIDACIÓN FINAL** (15 min)
   - npm run qa:guard
   - Lighthouse CI
   - Reporte final

**TIEMPO TOTAL ESTIMADO:** 1 hora
**CALIDAD TARGET:** 96%
**DoD ACHIEVEMENT:** 100%