// Latencia baja: troceo + ajustes "rápidos" en ElevenLabs
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
    }};
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  if (!apiKey) return { statusCode: 500, body: "ELEVENLABS_API_KEY not configured" };

  let text;
  try { ({ text } = JSON.parse(event.body || "{}")); }
  catch { return { statusCode: 400, body: "Invalid JSON" }; }

  if (!text || !String(text).trim()) {
    return { statusCode: 400, body: "Missing 'text'" };
  }

  // 1) Troceo en ~180 caracteres para inicio rápido (no solapado)
  const chunks = [];
  const T = String(text).trim();
  const maxLen = 180;
  for (let i = 0; i < T.length; i += maxLen) {
    chunks.push(T.slice(i, i + maxLen));
  }

  // 2) Generar cada chunk y concatenar binarios
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const headers = { "xi-api-key": apiKey, "content-type": "application/json", "accept": "audio/mpeg" };

  const buffers = [];
  for (const part of chunks) {
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: part,
        model_id: "eleven_turbo_v2_5",
        // Ajustes "rápidos": algo menos de calidad, más velocidad de respuesta
        voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
      }),
    });
    if (!resp.ok) {
      const msg = await resp.text().catch(()=> "");
      return { statusCode: resp.status, body: `TTS upstream error: ${msg.slice(0,400)}` };
    }
    buffers.push(Buffer.from(await resp.arrayBuffer()));
  }

  // 3) Unir MP3 (nota: concatenación simple funciona para la mayoría de players)
  const combined = Buffer.concat(buffers);
  return {
    statusCode: 200,
    headers: {
      "content-type": "audio/mpeg",
      "access-control-allow-origin": "*",
      "cache-control": "no-store",
    },
    body: combined.toString("base64"),
    isBase64Encoded: true,
  };
};