export default async (req) => {
  try {
    const { text, plan = "visitor" } = await req.json();

    // 1) Pide respuesta al upstream (tu backend en .es)
    const up = await fetch(process.env.UPSTREAM_API_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.UPSTREAM_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ text, plan })
    });
    if (!up.ok) throw new Error(`Upstream ${up.status}`);
    const { reply } = await up.json();

    // 2) Convierte a MP3 con ElevenLabs
    const tts = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "content-type": "application/json",
        "accept": "audio/mpeg"
      },
      body: JSON.stringify({
        model_id: "eleven_turbo_v2",
        optimize_streaming_latency: 3,
        output_format: "mp3_44100_128",
        text: reply
      })
    });
    if (!tts.ok) throw new Error(`TTS ${tts.status}`);
    const buf = await tts.arrayBuffer();

    return new Response(buf, { status: 200, headers: { "content-type": "audio/mpeg" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { "content-type": "application/json" }
    });
  }
};