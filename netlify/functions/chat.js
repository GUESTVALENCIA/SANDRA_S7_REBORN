const { makeCorsHeaders, preflight } = require('./_cors.js');

exports.handler = async (event) => {
  const cors = makeCorsHeaders(event.headers.origin || event.headers.Origin);
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== 'POST') return { statusCode:405, headers:cors, body:'Method Not Allowed' };

  // Si quisieras cerrar el chat, pon CHAT_REQUIRES_KEY=true en Netlify
  if (String(process.env.CHAT_REQUIRES_KEY||'false')==='true') {
    const k = event.headers['x-sandra-key'] || event.headers['X-Sandra-Key'];
    if (!k || k !== process.env.TRAINING_API_KEY) return { statusCode:401, headers:cors, body:'Unauthorized' };
  }

  let body; try{ body=JSON.parse(event.body||'{}'); }catch{ return { statusCode:400, headers:cors, body:'Bad JSON' }; }
  const text=(body.text||'').toString().trim();
  const persona=(body.persona||'developer').toString();
  const loras=Array.isArray(body.loras)? body.loras:[];

  if(!text) return { statusCode:400, headers:cors, body:'Missing text' };

  const { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, UPSTREAM_API_URL, UPSTREAM_CHAT_PATH='/chat', UPSTREAM_API_KEY } = process.env;

  // 1) Upstream (opcional)
  let reply='';
  if (UPSTREAM_API_URL) {
    try{
      const base=UPSTREAM_API_URL.replace(/\/+$/,'');
      const path=UPSTREAM_CHAT_PATH.startsWith('/')? UPSTREAM_CHAT_PATH : '/'+UPSTREAM_CHAT_PATH;
      const r = await fetch(base+path, {
        method:'POST',
        headers:{ 'content-type':'application/json', ...(UPSTREAM_API_KEY? {'authorization':`Bearer ${UPSTREAM_API_KEY}`} : {}) },
        body: JSON.stringify({ text, persona, meta:{ loras } })
      });
      if (r.ok) {
        const ct=r.headers.get('content-type')||'';
        reply = ct.includes('application/json') ? ((await r.json()).reply || '') : (await r.text());
      }
    }catch {}
  }
  if(!reply) reply = `He recibido: "${text}". Soy Sandra (${persona}). ¿Cómo sigo?`;

  // 2) Si no hay ElevenLabs -> devuelve JSON
  if(!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID){
    return { statusCode:200, headers:{...cors,'Content-Type':'application/json'}, body: JSON.stringify({ reply, persona }) };
  }

  // 3) ElevenLabs → MP3
  const url=`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(ELEVENLABS_VOICE_ID)}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`;
  const tts = await fetch(url, {
    method:'POST',
    headers:{ 'xi-api-key':ELEVENLABS_API_KEY, 'accept':'audio/mpeg', 'content-type':'application/json' },
    body: JSON.stringify({ text: reply, model_id:'eleven_turbo_v2', voice_settings:{ stability:0.5, similarity_boost:0.7 } })
  });
  const buf = Buffer.from(await tts.arrayBuffer());
  return { statusCode:tts.status, headers:{...cors,'Content-Type':'audio/mpeg','Cache-Control':'no-store'}, body: buf.toString('base64'), isBase64Encoded:true };
};
