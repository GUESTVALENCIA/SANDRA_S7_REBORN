function parseAllowList(){const raw=process.env.ALLOW_ORIGIN||'';return raw.split(',').map(s=>s.trim()).filter(Boolean);}
const ALLOWLIST=parseAllowList();
function makeCorsHeaders(originHeader){
  const origin=originHeader||'';
  const allowed=!ALLOWLIST.length||ALLOWLIST.includes(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? (origin||'') : (ALLOWLIST[0]||'*'),
    'Vary':'Origin',
    'Access-Control-Allow-Headers':'Content-Type, Authorization, X-Sandra-Key',
    'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
  };
}
function preflight(event){
  if(event.httpMethod==='OPTIONS'){
    return { statusCode:204, headers:makeCorsHeaders(event.headers.origin||event.headers.Origin) };
  }
  return null;
}
module.exports={ makeCorsHeaders, preflight };