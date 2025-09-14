# Sandra S7 • Reborn (Netlify-Ready)

**Qué incluye**
- `/public/index.html` con UI Texto/Voz/Avatar.
- JS limpio en `/public/assets/js/`:
  - `config.js`: endpoints y ajustes.
  - `sandra.js`: chat + TTS + dictado (webkitSpeechRecognition) + avatar postMessage.
- `netlify/functions`:
  - `chat.js`: proxy a tu backend (`UPSTREAM_API_URL` + `UPSTREAM_API_KEY`) o respuesta demo.
  - `token-realtime.js`: token efímero de ejemplo.
- `netlify.toml`: publish=`public`, CORS y redirects `/chat` y `/token/realtime` → Functions.
- `/public/test.html`: pruebas rápidas.

**Despliegue (Netlify)**
1. Conecta repo y deja publish = `public` (este repo ya trae `netlify.toml`).
2. Variables de entorno (en Netlify → Site settings → Environment):
   - `UPSTREAM_API_URL` = `https://api.guestsvalencia.com/sandra/v7` (opcional; si no, echo demo)
   - `UPSTREAM_API_KEY` = `gv_sandra_7_prod_2024_auth_token_valencia_premium` (si tienes backend propio)
   - `ALLOW_ORIGIN` = `https://guestsvalencia.es`
3. Deploy. Abre `/test.html` y verifica ✅.
4. Usa `/` (index) para la UI completa.

**Uso rápido en la página**
- Escribe y pulsa **Enviar**.
- Pestaña **Voz** → botón “Mantener para dictar” → suelta para enviar → la IA responde y **lee** en voz alta.
- **Avatar**: pulsa *Cargar Avatar* (requiere que el origen permita ser embebido).

**Seguridad**
- La API Key nunca está en el navegador: vive en las Functions del servidor.
- CORS limitado a tu dominio.

**Personalización**
- Cambia color/estilos en `<style>` de `index.html`.
- Cambia idioma por defecto en `config.js` → `LANGUAGE`.
