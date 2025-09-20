# INSTRUCCIONES CONFIGURACIÓN VARIABLES NETLIFY - SANDRA IA 7.0

## SITIO: sandra-s7-reborn (https://guestsvalencia.es)
## ID: 377e9ece-564f-4a25-89e5-99b77f3b9c69

## PASO 1: ACCEDER A NETLIFY DASHBOARD

1. Ir a: https://app.netlify.com/sites/sandra-s7-reborn/configuration/env
2. Login con: claytis33@gmail.com

## PASO 2: AGREGAR VARIABLES DE ENTORNO

Click "Add a variable" para cada una:

### VARIABLES CRÍTICAS (REQUERIDAS)

| Variable | Valor | Scope |
|----------|-------|-------|
| OPENAI_API_KEY | [Ver archivo local seguro keys.txt] | Functions |
| ELEVENLABS_API_KEY | [Obtener de cuenta ElevenLabs] | Functions |
| ELEVENLABS_VOICE_ID | 21m00Tcm4TlvDq8ikWAM | Functions |
| TRAINING_API_KEY | gv_train_s7_S4ndraValencia_8k9ZrT2pQ6 | Functions |
| ALLOW_ORIGIN | https://guestsvalencia.es,https://www.guestsvalencia.es | Functions |
| TRAINING_ENABLED | true | Functions |
| CHAT_REQUIRES_KEY | false | Functions |

### VARIABLES OPCIONALES

| Variable | Valor | Scope |
|----------|-------|-------|
| UPSTREAM_API_URL | https://api.guestsvalencia.es/sandra/v7 | Functions |
| UPSTREAM_CHAT_PATH | /chat | Functions |

## PASO 3: TRIGGER DEPLOY

Después de configurar todas las variables:

1. Ir a: https://app.netlify.com/sites/sandra-s7-reborn/deploys
2. Click "Trigger deploy" > "Clear cache and deploy"
3. Esperar ~2-3 minutos para el despliegue

## PASO 4: VERIFICACIÓN

```bash
# Test endpoint chat
curl -X POST https://guestsvalencia.es/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola Sandra"}'

# Test TTS
curl -X POST https://guestsvalencia.es/api/sandra-chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Test de voz Sandra IA"}' \
  --output test.mp3
```

## NOTAS IMPORTANTES:

- Las API keys están guardadas de forma segura en archivos locales
- No compartir API keys en repositorios públicos
- Después del deploy, verificar en: https://guestsvalencia.es
- El widget Sandra debe aparecer en la esquina inferior derecha

---
Fecha: 20/09/2025
Estado: PENDIENTE configuración manual