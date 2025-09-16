
function json(res, status=200){ return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(res) }; }
function corsHeaders(){
  const h = {
    "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "https://guestsvalencia.es,https://*.guestsvalencia.es,https://claytomsystems.com,https://*.claytomsystems.com,https://*.netlify.app,http://localhost:8888",
    "Access-Control-Allow-Headers": "content-type, x-sandra-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  return h;
}

// Sencilla validación y eco; guarda a futuro con KV/Blobs si quieres
exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };
  try{
    const headers = corsHeaders();
    if (process.env.TRAINING_ENABLED === "true") {
      const k = event.headers["x-sandra-key"] || event.headers["X-Sandra-Key"];
      if (k !== process.env.TRAINING_API_KEY) {
        return { statusCode: 401, headers, body: "Unauthorized" };
      }
    }
    const body = JSON.parse(event.body || "{}");
    // Validar estructura mínima
    if(!body.input || !body.output){
      return { statusCode: 400, headers, body: "Bad Request: faltan campos input/output" };
    }
    // Aquí podrías enviar el ejemplo a tu backend si defines TRAINING_WEBHOOK_URL
    // Por ahora, eco
    return { statusCode: 200, headers, body: JSON.stringify({ ok:true }) };
  }catch(e){
    return json({ error: e.message || String(e) }, 500);
  }
};
