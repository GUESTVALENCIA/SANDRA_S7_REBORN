const { makeCorsHeaders, preflight } = require('./_cors.js');
exports.handler = async (event)=>{
  const cors = makeCorsHeaders(event.headers.origin || event.headers.Origin);
  const pf = preflight(event); if (pf) return pf;

  const m=event.httpMethod; if(!['GET','POST'].includes(m)) return { statusCode:405, headers:cors, body:'Method Not Allowed' };
  const u=(event.queryStringParameters && event.queryStringParameters.url) || '';
  if(!u || !/^https?:\/\//i.test(u)) return { statusCode:400, headers:cors, body:'Missing or invalid url' };

  const init={ method:m, headers:{} };
  if (m==='POST') init.body=event.body;
  for (const [k,v] of Object.entries(event.headers||{})) {
    if (/^content-type$/i.test(k) || /^authorization$/i.test(k)) init.headers[k]=v;
  }
  const r=await fetch(u, init);
  const ct=r.headers.get('content-type')||'application/octet-stream';
  const buf=Buffer.from(await r.arrayBuffer());
  return { statusCode:r.status, headers:{...cors,'content-type':ct,'cache-control':'no-store'}, body: buf.toString('base64'), isBase64Encoded:true };
};