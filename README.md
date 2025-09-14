# HouseRentValencia · Recovery Pack

Minimal re-encendido de **HouseRentValencia + Sandra IA** listo para Netlify.

## Estructura

```
public/
  index.html
  js/app.js
  test.html
netlify/
  functions/
    ping.js
    reply.js
    heygen-share.js
netlify.toml
```

## Despliegue rápido (Netlify)

1. **Crear sitio** → *Import from Git* o **Deploys → Upload deploy** y sube este ZIP.
2. Variables de entorno (opcional para avatar real):
   - `HEYGEN_API_KEY` (si quieres URL de embed real; sin esto devuelve demo).
3. Abre `/test.html` para verificar:
   - `/.netlify/functions/ping` ✅
   - `/.netlify/functions/reply` ✅
   - `/.netlify/functions/heygen-share` ✅
4. En `index.html` pulsa 🗣️ para abrir el panel. El botón **Enviar** usa `reply.js` (devuelve JSON) y el cliente
   locuta con **voz del navegador** (modo seguro, sin depender de TTS externo).

> Cuando quieras TTS en servidor (Cartesia/ElevenLabs), cambia `reply.js` para devolver audio (audio/mpeg) y el
> cliente ya lo reproducirá automáticamente si el `Content-Type` no es JSON.
