# Rollback Procedures - GuestsValencia PWA

## 🚨 Emergency Rollback (< 5 minutos)

### Netlify Dashboard Rollback
1. Ir a https://app.netlify.com/sites/guestsvalencia/deploys
2. Encontrar el último deploy estable (✅ verde)
3. Click "..." → "Publish deploy"
4. Confirmar rollback
5. Verificar con smoke test: `./ops/smoke.sh`

### GitHub Rollback (si dashboard falla)
```bash
# 1. Identificar último commit estable
git log --oneline -10

# 2. Crear rama de rollback
git checkout -b rollback-$(date +%Y%m%d-%H%M)

# 3. Revertir al commit estable
git reset --hard <COMMIT_HASH_ESTABLE>

# 4. Force push (SOLO en emergencia)
git push origin main --force

# 5. Verificar deploy automático en Netlify
```

## 📊 Rollback por Tipo de Fallo

### PWA Manifest Corrupto
```bash
# Restaurar manifest básico
cat > manifest.webmanifest << 'EOF'
{
  "name": "GuestsValencia",
  "short_name": "GV",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#0b1020",
  "theme_color": "#0b1020"
}
EOF
```

### Service Worker Problemático
```bash
# Desactivar SW temporalmente
cat > sw.js << 'EOF'
// SW desactivado temporalmente
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
EOF
```

### API Endpoints 5xx
```bash
# Verificar logs
netlify logs --site guestsvalencia

# Revisar variables de entorno
netlify env:list --site guestsvalencia

# Rollback a variables estables
netlify env:set SANDRA_API_KEY "$BACKUP_KEY" --site guestsvalencia
```

## 🔍 Monitoring Durante Rollback

### Verificaciones Post-Rollback
```bash
# 1. Smoke test completo
./ops/smoke.sh https://guestsvalencia.es

# 2. Verificar PWA funcionalidad
curl -I https://guestsvalencia.es/manifest.webmanifest

# 3. Test endpoints críticos
curl -f https://guestsvalencia.es/api/chat || echo "API down"

# 4. Verificar analytics (si aplica)
# Revisar Google Analytics Real-Time
```

### Logs de Monitoreo
```bash
# Durante rollback, monitorear:
watch -n 5 'curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://guestsvalencia.es'

# Verificar errores 5xx
netlify logs --follow --site guestsvalencia | grep -E "(5[0-9]{2}|error)"
```

## 📋 Checklist de Rollback Exitoso

- [ ] Site carga correctamente (200)
- [ ] PWA manifest accesible
- [ ] Service Worker registra sin errores
- [ ] Funcionalidad crítica funciona
- [ ] No errores 5xx en logs
- [ ] Time-to-first-byte < 2s
- [ ] Mobile/desktop funcional
- [ ] Analytics funcionando (opcional)

## 🚨 Contactos de Emergencia

**CEO/CTO:** @clayt (Telegram/WhatsApp)
**Soporte Técnico:** support@claytomsystems.com
**Netlify Support:** (solo si problema de plataforma)

## 📝 Post-Mortem Template

```markdown
# Incident Report - [FECHA]

## Resumen
- **Incidente:** [Descripción breve]
- **Impacto:** [Duración, usuarios afectados]
- **Root Cause:** [Causa raíz identificada]

## Timeline
- [HH:MM] Inicio del problema
- [HH:MM] Detección
- [HH:MM] Rollback iniciado
- [HH:MM] Servicio restaurado

## Lecciones Aprendidas
- [Mejora 1]
- [Mejora 2]

## Acciones Preventivas
- [ ] [Acción 1]
- [ ] [Acción 2]
```