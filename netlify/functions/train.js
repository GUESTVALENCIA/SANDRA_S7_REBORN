
const { makeCorsHeaders, preflight } = require('./_cors.js');

exports.handler = async (event)=>{
  const cors = makeCorsHeaders(event.headers.origin || event.headers.Origin);
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== 'POST') return { statusCode:405, headers:cors, body:'Method Not Allowed' };

  if (String(process.env.TRAINING_ENABLED||'false')==='true') {
    const k = event.headers['x-sandra-key'] || event.headers['X-Sandra-Key'];
    if (!k || k !== process.env.TRAINING_API_KEY) return { statusCode:401, headers:cors, body:'Unauthorized' };
  }

  // Aquí podrías reenviar a tu UPSTREAM_TRAIN_URL o guardar en Neon
  return { statusCode:200, headers:{...cors,'Content-Type':'application/json'}, body: JSON.stringify({ ok:true }) };
};
