exports.handler = async (event) => ({ 
  statusCode: 200, 
  headers: {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
},
  body: JSON.stringify({ ok: true, ts: Date.now() }) 
});
