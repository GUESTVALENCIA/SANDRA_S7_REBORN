// netlify/functions/chat.js
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const ELEVEN_KEY   = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE = process.env.ELEVENLABS_VOICE_ID || "Rachel";
const UPSTREAM_URL = process.env.UPSTREAM_API_URL;       // ej: https://api.guestsvalencia.es/sandra/v7
const UPSTREAM_KEY = process.env.UPSTREAM_API_KEY || "";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";

// Utilidad para responder binario (MP3) en Netlify
function mp3Response(buffer) {
  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      "Content-Type": "audio/mpeg",
      "Access-Control-Allow-Origin": ALLOW_ORIGIN,
      "Cache-Control": "no-store"
    },
    body: Buffer.from(buffer).toString("base64"),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { text = "" } = JSON.parse(event.body || "{}");
    const prompt = text.trim() || "Hola, ¿en qué puedo ayudarte?";

    // 1) Intento de respuesta real del UPSTREAM (opcional)
    let reply = "";
    if (UPSTREAM_URL) {
      try {
        const r = await fetch(`${UPSTREAM_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(UPSTREAM_KEY ? { "Authorization": `Bearer ${UPSTREAM_KEY}` } : {})
          },
          body: JSON.stringify({ text: prompt })
        });
        if (r.ok) {
          const j = await r.json().catch(() => ({}));
          reply = j.reply || j.text || j.message || "";
        }
      } catch (_) { /* fallback abajo */ }
    }
    if (!reply) reply = `He recibido tu mensaje: "${prompt}". ¿Qué necesitas?`;

    // 2) TTS ElevenLabs → MP3
    if (!ELEVEN_KEY) {
      // Si no hay clave, devolvemos MP3 "silencioso" cortito para no romper el flujo
      const silent = Buffer.alloc(0);
      return mp3Response(silent);
    }

    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}/stream?optimize_streaming_latency=3`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY,
          "Accept": "audio/mpeg",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: reply,
          model_id: "eleven_turbo_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.7 }
        })
      }
    );

    if (!ttsRes.ok) {
      const errTxt = await ttsRes.text().catch(()=>String(ttsRes.status));
      return { statusCode: 502, body: `TTS error: ${errTxt}` };
    }

    const mp3Buffer = Buffer.from(await ttsRes.arrayBuffer());
    return mp3Response(mp3Buffer);

  } catch (e) {
    return { statusCode: 500, body: `chat error: ${e.message}` };
  }
};
