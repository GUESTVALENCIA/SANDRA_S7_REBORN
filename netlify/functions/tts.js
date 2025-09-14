// netlify/functions/tts.js
export const handler = async (event) => {
  try {
    const { text = "Hola, soy Sandra." } = JSON.parse(event.body || "{}");
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // tu voz
    const apiKey  = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: "Missing ELEVENLABS_API_KEY" };
    }

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3&output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          model_id: "eleven_turbo_v2", // o el que uses
          text,
          voice_settings: { stability: 0.5, similarity_boost: 0.7 }
        })
      }
    );

    if (!r.ok) {
      const errText = await r.text();
      return { statusCode: 502, body: `TTS error: ${errText}` };
    }

    const buf = Buffer.from(await r.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "*",
        "Cache-Control": "no-store"
      },
      body: buf.toString("base64"),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: `Server error: ${e.message}` };
  }
};