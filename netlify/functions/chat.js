
const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

function json(res, status=200){ return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(res) }; }
function corsHeaders(){
  const h = {
    "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN?.split(",")[0] || "*",
    "Access-Control-Allow-Headers": "content-type, x-sandra-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  return h;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };
  try{
    const headers = corsHeaders();

    // Training gate
    if (process.env.TRAINING_ENABLED === "true") {
      const k = event.headers["x-sandra-key"] || event.headers["X-Sandra-Key"];
      if (k !== process.env.TRAINING_API_KEY) {
        return { statusCode: 401, headers, body: "Unauthorized" };
      }
    }

    const { text="", persona="developer" } = JSON.parse(event.body || "{}");

    // 1) Obtener respuesta de OpenAI API gratuita primero, luego backend
    let reply = "";

    // Prioridad 1: OpenAI API directa (gratuita)
    if(process.env.OPENAI_API_KEY){
      try{
        const systemPrompt = getSystemPrompt(persona);
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text }
            ],
            max_tokens: 300,
            temperature: 0.7
          })
        });
        if(r.ok){
          const data = await r.json();
          reply = data.choices[0].message.content;
        }
      }catch(e){
        console.log("OpenAI API falló:", e.message);
      }
    }

    // Prioridad 2: Backend upstream (si no hay OpenAI o falló)
    if(!reply && process.env.UPSTREAM_API_URL){
      try{
        const u = process.env.UPSTREAM_API_URL.replace(/\/+$/,"") + "/chat";
        const r = await fetch(u, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": process.env.UPSTREAM_API_KEY ? `Bearer ${process.env.UPSTREAM_API_KEY}` : undefined
          },
          body: JSON.stringify({ text, persona })
        });
        if(r.ok){
          const data = await r.json().catch(()=>null);
          reply = data?.reply || data?.message || data?.text || "";
        }
      }catch(e){
        console.log("Backend upstream falló:", e.message);
      }
    }

    // Fallback local si todo falla
    if(!reply){
      reply = generateSmartResponse(text, persona);
    }

    // 2) Si hay ElevenLabs, devolver MP3; si no, JSON
    const XI = process.env.ELEVENLABS_API_KEY;
    const VOICE = (process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM").trim();
    if (XI) {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/stream?optimize_streaming_latency=3`;
      const payload = {
        text: reply,
        model_id: "eleven_turbo_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.7 }
      };
      const rr = await fetch(url, {
        method: "POST",
        headers: { "xi-api-key": XI, "Content-Type": "application/json", "Accept": "audio/mpeg" },
        body: JSON.stringify(payload)
      });
      if (rr.ok) {
        const buf = Buffer.from(await rr.arrayBuffer());
        return {
          statusCode: 200,
          headers: { ...headers, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
          body: buf.toString("base64"),
          isBase64Encoded: true
        };
      }
    }

    return { statusCode: 200, headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ reply }) };
  }catch(e){
    return json({ error: e.message || String(e) }, 500);
  }
};

// Prompts personalizados según la persona
function getSystemPrompt(persona) {
  const prompts = {
    developer: `Eres Sandra, asistente técnica de ClayTomSystems especializada en desarrollo. Respondes con código, arquitecturas, soluciones técnicas. Siempre incluyes ejemplos prácticos y consideras las mejores prácticas. Eres concisa pero completa.`,
    recepcion: `Eres Sandra, recepcionista virtual de GuestsValencia. Ayudas con reservas, información de alojamientos, check-in/check-out. Eres cálida, profesional y orientada al cliente. Respondes en español con cortesía.`,
    ventas: `Eres Sandra, especialista en ventas de ClayTomSystems. Presentas soluciones, destacas beneficios, manejas objeciones. Eres persuasiva pero honesta. Te enfocas en el valor y ROI para el cliente.`,
    soporte: `Eres Sandra, agente de soporte técnico. Resuelves problemas paso a paso, diagnosticas errores, proporcionas soluciones claras. Eres paciente y detallada en tus explicaciones.`
  };
  return prompts[persona] || prompts.developer;
}

// Respuesta inteligente de fallback
function generateSmartResponse(text, persona) {
  const msg = text.toLowerCase();
  const responses = {
    developer: {
      greeting: "¡Hola! Soy Sandra, tu asistente técnica. ¿En qué proyecto puedo ayudarte hoy?",
      help: "Como Sandra Developer, puedo ayudarte con arquitectura, código, APIs, deployment y mejores prácticas. ¿Qué necesitas desarrollar?",
      default: `Entiendo que necesitas ayuda con "${text}". Como desarrolladora, te recomiendo empezar por definir los requisitos técnicos. ¿Podrías darme más detalles?`
    },
    recepcion: {
      greeting: "¡Bienvenido a GuestsValencia! Soy Sandra, ¿en qué puedo asistirte con tu reserva?",
      help: "Puedo ayudarte con reservas, información de alojamientos, servicios y todo lo relacionado con tu estancia. ¿Qué necesitas?",
      default: `He recibido tu consulta sobre "${text}". Permíteme ayudarte con esa información. ¿Podrías ser más específico?`
    },
    ventas: {
      greeting: "¡Hola! Soy Sandra de ClayTomSystems. ¿Estás interesado en nuestras soluciones de IA?",
      help: "Te puedo mostrar cómo nuestras soluciones pueden transformar tu negocio. ¿Qué desafíos estás enfrentando?",
      default: `Interesante consulta sobre "${text}". Creo que tenemos la solución perfecta para ti. ¿Hablamos de tus objetivos?`
    },
    soporte: {
      greeting: "Hola, soy Sandra del equipo de soporte. ¿Qué problema puedo ayudarte a resolver?",
      help: "Estoy aquí para resolver cualquier incidencia técnica paso a paso. Describe el problema y te ayudo.",
      default: `He registrado tu consulta sobre "${text}". Para ayudarte mejor, ¿podrías describir el problema con más detalle?`
    }
  };

  const persona_responses = responses[persona] || responses.developer;

  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('saludar')) {
    return persona_responses.greeting;
  }
  if (msg.includes('ayuda') || msg.includes('help') || msg.includes('que puedes')) {
    return persona_responses.help;
  }

  return persona_responses.default;
}
