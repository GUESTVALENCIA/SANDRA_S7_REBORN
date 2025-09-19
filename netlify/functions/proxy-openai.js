const { makeCorsHeaders, preflight } = require('./_cors.js');
exports.handler = async (event)=>{
  const cors = makeCorsHeaders(event.headers.origin || event.headers.Origin);
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod!=='POST') return { statusCode:405, headers:cors, body:'Method Not Allowed' };
  if (!process.env.OPENAI_API_KEY) return { statusCode:500, headers:cors, body:'Missing OPENAI_API_KEY' };

  let body; try{ body=JSON.parse(event.body||'{}'); }catch{ return { statusCode:400, headers:cors, body:'Bad JSON' }; }
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'content-type':'application/json', 'authorization':`Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify(body)
  });
  const ct=r.headers.get('content-type')||'application/json';
  const buf=Buffer.from(await r.arrayBuffer());
  return { statusCode:r.status, headers:{...cors,'content-type':ct,'cache-control':'no-store'}, body: buf.toString('base64'), isBase64Encoded:true };
};