// Requiere: OPENAI_API_KEY
// Usa OpenAI TTS (modelo actual compatible con SSML). Devuelve audio/mpeg base64.
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

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      statusCode: 501,
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ error: "OPENAI_API_KEY not configured; SSML not available" }),
    };
  }

  let ssml, voice;
  try { ({ ssml, voice } = JSON.parse(event.body || "{}")); }
  catch { return { statusCode: 400, body: "Invalid JSON" }; }
  if (!ssml || !String(ssml).trim()) return { statusCode: 400, body: "Missing 'ssml'" };

  // Modelo y voz por defecto
  const model = process.env.OPENAI_TTS_MODEL || "tts-1";
  const openaiVoice = voice || process.env.OPENAI_TTS_VOICE || "alloy";

  try {
    const resp = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice: openaiVoice,
        input: ssml,
        response_format: "mp3"
      })
    });

    if (!resp.ok) {
      const t = await resp.text().catch(()=> "");
      return { statusCode: resp.status, body: `OpenAI TTS error: ${t.slice(0,600)}` };
    }
    const buf = Buffer.from(await resp.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        "content-type": "audio/mpeg",
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
      },
      body: buf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 500, body: `TTS SSML error: ${e.message}` };
  }
};