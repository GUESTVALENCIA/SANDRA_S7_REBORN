// netlify/functions/chat.js - OPTIMIZADO PARA FRONTEND PREMIUM
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";

exports.handler = async (event) => {
  // Headers CORS
  const headers = {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { message = "", returnAudio = false } = JSON.parse(event.body || "{}");
    const prompt = message.trim() || "Hola, ¿en qué puedo ayudarte?";

    // 1) Respuesta de OpenAI GPT-4 (OPTIMIZADO)
    let reply = "";
    if (OPENAI_API_KEY) {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "Eres Sandra, una asistente virtual inteligente de ClayTom Systems especializada en desarrollo web, gestión hotelera y atención al cliente. Responde de manera profesional, concisa y útil en español."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        });

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json();
          reply = openaiData.choices?.[0]?.message?.content || "";
        }
      } catch (err) {
        console.error('OpenAI error:', err.message);
      }
    }

    // Fallback response si no hay OpenAI
    if (!reply) {
      reply = `Hola, he recibido tu mensaje: "${prompt}". ¿En qué más puedo ayudarte?`;
    }

    // 2) Preparar respuesta JSON
    const response = {
      response: reply,
      success: true
    };

    // 3) TTS ElevenLabs (SOLO SI SE SOLICITA Y HAY CLAVE)
    if (returnAudio && ELEVEN_KEY) {
      try {
        const ttsRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}`,
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
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.7
              }
            })
          }
        );

        if (ttsRes.ok) {
          const mp3Buffer = Buffer.from(await ttsRes.arrayBuffer());
          response.audioBase64 = mp3Buffer.toString("base64");
        }
      } catch (ttsErr) {
        console.error('TTS error:', ttsErr.message);
        // No fallar si TTS falla, solo enviar texto
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (e) {
    console.error('Chat function error:', e.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        success: false
      })
    };
  }
};
