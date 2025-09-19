// Node AWS Lambda style (válido en Netlify)
const fetch = global.fetch;

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body || "{}");
    if(\!text) return { statusCode: 400, body: "Missing text" };

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // tu voz

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        model_id: "eleven_turbo_v2",
        text,
        voice_settings: { stability: 0.5, similarity_boost: 0.7 }
      })
    });

    if(\!r.ok){
      const msg = await r.text();
      return { statusCode: 500, body: "ElevenLabs error: " + msg };
    }

    const buf = Buffer.from(await r.arrayBuffer());
    return {
      statusCode: 200,
      headers: { "Content-Type": "audio/mpeg" },
      body: buf.toString("base64"),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: "Server error: " + e.message };
  }
};
