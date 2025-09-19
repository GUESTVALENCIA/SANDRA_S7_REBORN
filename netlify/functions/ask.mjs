const allowCORS = (origin) => {
  const allowed = (process.env.ALLOW_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : "*";
};

export default async (req) => {
  const origin = req.headers.get("origin") || "";
  const cors = { "Access-Control-Allow-Origin": allowCORS(origin) };

  try {
    const isForm = (req.headers.get("content-type") || "").includes("application/json") === false;
    let text = "";

    if (!isForm) {
      // JSON: { text: "..." }
      const body = await req.json().catch(()=> ({}));
      text = (body && body.text) || "";
    } else {
      // (Opcional) multipart con audio → aquí podríamos hacer STT;
      // de momento respondemos cortesía:
      text = "He recibido tu audio. ¿Cómo puedo ayudarte con tu reserva?";
    }

    // 1) LLM upstream
    let reply = "Hola, ¿en qué puedo ayudarte?";
    if (process.env.UPSTREAM_API_URL) {
      const r = await fetch(process.env.UPSTREAM_API_URL, {
        method: "POST",
        headers: {
          "content-type":"application/json",
          "authorization": `Bearer ${process.env.UPSTREAM_API_KEY || ""}`
        },
        body: JSON.stringify({ input: text })
      });
      try {
        const j = await r.json();
        reply = j.reply || j.text || j.message || reply;
      } catch { /* usa reply por defecto */ }
    }

    // 2) ElevenLabs → MP3
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const elKey = process.env.ELEVENLABS_API_KEY;
    if (!voiceId || !elKey) {
      return new Response("Falta ELEVENLABS_*", { status:500, headers: cors });
    }

    const ttsURL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`;
    const tts = await fetch(ttsURL, {
      method: "POST",
      headers: {
        "xi-api-key": elKey,
        "content-type": "application/json",
        "accept": "audio/mpeg"
      },
      body: JSON.stringify({
        model_id: "eleven_turbo_v2",
        text: reply,
        voice_settings: { stability: 0.5, similarity_boost: 0.7 }
      })
    });

    if (!tts.ok) {
      return new Response(`ElevenLabs error ${tts.status}`, { status:502, headers: cors });
    }

    const buf = await tts.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: { ...cors, "content-type": "audio/mpeg" }
    });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status:500, headers: cors });
  }
};

// Preflight
export const config = {
  path: "/.netlify/functions/ask"
};