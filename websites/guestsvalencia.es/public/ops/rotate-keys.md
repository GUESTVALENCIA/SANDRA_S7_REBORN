# Playbook: Rotación de Claves - GuestsValencia

## 🔐 Cronograma de Rotación

### Rotación Trimestral (Obligatoria)
- **Q1:** Enero 15 - Sandra API Keys
- **Q2:** Abril 15 - ElevenLabs API Keys
- **Q3:** Julio 15 - HeyGen API Keys
- **Q4:** Octubre 15 - WhatsApp Webhook Secrets

### Rotación de Emergencia (Inmediata)
- Cuando hay sospecha de compromiso
- Después de cambios de personal
- Ante alertas de seguridad del proveedor

## 🔄 Procedimiento de Rotación

### 1. Sandra API Keys

#### Preparación
```bash
# Backup actual
netlify env:get SANDRA_API_KEY --site guestsvalencia > sandra_key_backup.txt

# Generar nueva clave en ClayTom Systems panel
# URL: https://panel.claytomsystems.com/api-keys
```

#### Rotación
```bash
# 1. Verificar nueva clave en staging
netlify env:set SANDRA_API_KEY "sandra_new_key_sk_xxx" --site preview-guestsvalencia

# 2. Test smoke en preview
./ops/smoke.sh https://preview--guestsvalencia.netlify.app

# 3. Si OK, aplicar a producción
netlify env:set SANDRA_API_KEY "sandra_new_key_sk_xxx" --site guestsvalencia

# 4. Verificar producción
./ops/smoke.sh https://guestsvalencia.es

# 5. Revocar clave anterior en panel
```

### 2. ElevenLabs API Keys

#### Preparación
```bash
# Backup actual
netlify env:get ELEVENLABS_API_KEY --site guestsvalencia > elevenlabs_key_backup.txt

# Generar nueva clave en ElevenLabs
# URL: https://elevenlabs.io/app/speech-synthesis/api-keys
```

#### Rotación
```bash
# 1. Test nueva clave
curl -H "xi-api-key: sk_new_elevenlabs_key" \
     https://api.elevenlabs.io/v1/user

# 2. Deploy a staging
netlify env:set ELEVENLABS_API_KEY "sk_new_elevenlabs_key" --site preview-guestsvalencia

# 3. Test TTS functionality
curl -X POST https://preview--guestsvalencia.netlify.app/api/tts \
     -H "Content-Type: application/json" \
     -d '{"text":"Test de nueva clave","voice_id":"21m00Tcm4TlvDq8ikWAM"}'

# 4. Si OK, aplicar a producción
netlify env:set ELEVENLABS_API_KEY "sk_new_elevenlabs_key" --site guestsvalencia

# 5. Verificar en producción
./ops/smoke.sh https://guestsvalencia.es
```

### 3. HeyGen API Keys

#### Preparación
```bash
# Backup actual
netlify env:get HEYGEN_API_KEY --site guestsvalencia > heygen_key_backup.txt

# Generar nueva clave en HeyGen
# URL: https://app.heygen.com/settings/api-keys
```

#### Rotación
```bash
# 1. Test nueva clave
curl -H "X-API-Key: hg_new_key_xxx" \
     https://api.heygen.com/v1/user.info

# 2. Deploy a staging
netlify env:set HEYGEN_API_KEY "hg_new_key_xxx" --site preview-guestsvalencia

# 3. Test avatar functionality
curl -X POST https://preview--guestsvalencia.netlify.app/api/avatar \
     -H "Content-Type: application/json" \
     -d '{"text":"Test avatar con nueva clave"}'

# 4. Si OK, aplicar a producción
netlify env:set HEYGEN_API_KEY "hg_new_key_xxx" --site guestsvalencia

# 5. Verificar en producción
./ops/smoke.sh https://guestsvalencia.es
```

### 4. WhatsApp Webhook Secrets

#### Preparación
```bash
# Generar nuevo secret
NUEVO_SECRET=$(openssl rand -hex 32)
echo "Nuevo WhatsApp secret: $NUEVO_SECRET"

# Backup actual
netlify env:get WHATSAPP_WEBHOOK_SECRET --site guestsvalencia > whatsapp_secret_backup.txt
```

#### Rotación
```bash
# 1. Actualizar secret en WhatsApp Business API
# URL: https://developers.facebook.com/apps/TU_APP_ID/webhooks/

# 2. Deploy a staging
netlify env:set WHATSAPP_WEBHOOK_SECRET "$NUEVO_SECRET" --site preview-guestsvalencia

# 3. Test webhook
curl -X POST https://preview--guestsvalencia.netlify.app/api/whatsapp-webhook \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=$(echo -n 'test_payload' | openssl dgst -sha256 -hmac "$NUEVO_SECRET" -binary | base64)" \
     -d '{"test": "payload"}'

# 4. Si OK, aplicar a producción
netlify env:set WHATSAPP_WEBHOOK_SECRET "$NUEVO_SECRET" --site guestsvalencia

# 5. Verificar en producción
./ops/smoke.sh https://guestsvalencia.es
```

## 🚨 Rollback de Emergencia

### Si la nueva clave falla
```bash
# 1. Restaurar clave anterior inmediatamente
netlify env:set SANDRA_API_KEY "$(cat sandra_key_backup.txt)" --site guestsvalencia

# 2. Verificar restauración
./ops/smoke.sh https://guestsvalencia.es

# 3. Investigar problema con nueva clave
# 4. Planificar nuevo intento de rotación
```

## 📋 Checklist de Rotación

### Pre-rotación
- [ ] Backup de claves actuales
- [ ] Nueva clave generada y verificada
- [ ] Test en staging exitoso
- [ ] Smoke test listo
- [ ] Ventana de mantenimiento comunicada

### Durante rotación
- [ ] Deploy a staging completado
- [ ] Tests funcionales en staging OK
- [ ] Deploy a producción completado
- [ ] Smoke test en producción OK
- [ ] Monitoreo activo por 30 min

### Post-rotación
- [ ] Clave anterior revocada
- [ ] Documentación actualizada
- [ ] Equipo notificado
- [ ] Próxima rotación calendario actualizado
- [ ] Backup de claves antigas eliminado (seguro)

## 📊 Monitoreo Post-Rotación

```bash
# Monitorear por 1 hora después de rotación
watch -n 30 './ops/smoke.sh https://guestsvalencia.es'

# Verificar logs de errores
netlify logs --site guestsvalencia | grep -E "(error|fail|unauthorized|403|401)"

# Monitorear métricas de API
# (Configurar alertas en dashboards de proveedores)
```

## 📞 Contactos de Rotación

**Responsable Principal:** CEO Clayton
**Backup:** CTO (Sandra IA)
**Soporte ClayTom:** support@claytomsystems.com
**Emergencias:** WhatsApp +34 XXX XXX XXX