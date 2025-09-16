# Variables de Entorno - Sandra S7 Reborn

## Configuración Requerida en Netlify

### 1. OpenAI ChatGPT
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```
- **Función:** Respuestas inteligentes de ChatGPT-4
- **Obtener en:** https://platform.openai.com/api-keys
- **Requerido:** Sí

### 2. ElevenLabs TTS
```
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
ELEVENLABS_VOICE_ID=Rachel
```
- **Función:** Conversión texto a voz
- **Obtener en:** https://elevenlabs.io/
- **Requerido:** Sí para audio

### 3. HeyGen Avatar
```
HEYGEN_API_KEY=your-heygen-api-key-here
HEYGEN_AVATAR_ID=your-heygen-avatar-id-here
```
- **Función:** Avatar visual animado
- **Obtener en:** https://heygen.com/
- **Requerido:** No (opcional)

### 4. API Upstream (Opcional)
```
UPSTREAM_API_URL=https://api.guestsvalencia.es/sandra/v7
UPSTREAM_API_KEY=your-upstream-api-key
```
- **Función:** Fallback a API externa
- **Requerido:** No

### 5. CORS
```
ALLOW_ORIGIN=*
```
- **Función:** Control de acceso
- **Requerido:** Sí

## Configuración en Netlify
1. Ir a: https://app.netlify.com/sites/sandra-s7-reborn/settings/env
2. Añadir cada variable con su valor
3. Deploy automático al guardar

## Prioridad de Respuestas
1. OpenAI ChatGPT (principal)
2. Upstream API (fallback) 
3. Respuesta genérica (último recurso)
