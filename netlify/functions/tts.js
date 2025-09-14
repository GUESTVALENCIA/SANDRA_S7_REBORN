// netlify/functions/tts.js
// Devuelve audio/mpeg con la respuesta de Sandra usando ElevenLabs.

export const handler = async (event) => {
  const allow = process.env.ALLOW_ORIGIN || "*";

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: cors(allow),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(allow), body: "Method Not Allowed" };
  }

  try {
    const { text } = JSON.parse(event.body || "{}");
    if (!text || typeof text !== "string") {
      return { statusCode: 400, headers: cors(allow), body: "Missing 'text'." };
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
    const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2";

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
      return { statusCode: 500, headers: cors(allow), body: "Missing ElevenLabs env vars." };
    }

    // (1) Obtener el texto de respuesta (tu "cerebro")
    let replyText = "";
    try {
      const base = process.env.UPSTREAM_API_URL;
      const key  = process.env.UPSTREAM_API_KEY || "";
      if (base) {
        const r = await fetch(`${base.replace(/\/$/, "")}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(key ? { "Authorization": `Bearer ${key}` } : {}),
          },
          body: JSON.stringify({ message: text }),
        });
        const j = await r.json().catch(() => ({}));
        replyText = j.reply || j.text || `Hola, he recibido tu mensaje: "${text}". ¿En qué más puedo ayudarte con tu estancia en Valencia?`;
      } else {
        replyText = `Hola, he recibido tu mensaje: "${text}". ¿En qué más puedo ayudarte con tu estancia en Valencia?`;
      }
    } catch {
      replyText = `Hola, he recibido tu mensaje: "${text}". ¿En qué más puedo ayudarte con tu estancia en Valencia?`;
    }

    // (2) Convertir a voz con ElevenLabs → audio/mpeg
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?optimize_streaming_latency=0`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          model_id: ELEVENLABS_MODEL_ID,
          text: replyText,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.7,
          },
        }),
      }
    );

    if (!ttsRes.ok) {
      const errTxt = await ttsRes.text().catch(() => "");
      return { statusCode: 502, headers: cors(allow), body: `TTS error: ${errTxt}` };
    }

    const arrayBuf = await ttsRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString("base64");

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        ...cors(allow),
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
      body: base64,
    };
  } catch (e) {
    return { statusCode: 500, headers: cors(allow), body: `Server error: ${e.message}` };
  }
};

function cors(allow) {
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}