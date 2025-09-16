const { makeCorsHeaders, preflight } = require('./_cors.js');
exports.handler = async (event)=>{
  const cors = makeCorsHeaders(event.headers.origin || event.headers.Origin);
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod!=='POST') return { statusCode:405, headers:cors, body:'Method Not Allowed' };
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID)
    return { statusCode:500, headers:cors, body:'Missing 11labs env' };

  let body; try{ body=JSON.parse(event.body||'{}'); }catch{ return { statusCode:400, headers:cors, body:'Bad JSON' } };
  const text=(body.text||'').toString().trim()||'Hola, soy Sandra.';
  const url=`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.ELEVENLABS_VOICE_ID)}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`;

  const r=await fetch(url,{ method:'POST', headers:{ 'xi-api-key':process.env.ELEVENLABS_API_KEY, 'accept':'audio/mpeg', 'content-type':'application/json' },
    body: JSON.stringify({ text, model_id:'eleven_turbo_v2', voice_settings:{ stability:0.5, similarity_boost:0.7 } })
  });
  const buf=Buffer.from(await r.arrayBuffer());
  return { statusCode:r.status, headers:{...cors,'content-type':'audio/mpeg','cache-control':'no-store'}, body:buf.toString('base64'), isBase64Encoded:true };
};