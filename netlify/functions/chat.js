// Netlify Function: /chat
// If UPSTREAM_API_URL + UPSTREAM_API_KEY env vars are set, we forward the request.
// Otherwise, we echo a friendly demo reply.

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const { message = "", language = "es" } = body;

    const upstream = process.env.UPSTREAM_API_URL;
    const apiKey = process.env.UPSTREAM_API_KEY;

    if (upstream && apiKey) {
      const r = await fetch(`${upstream.replace(/\/$/,"")}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ message, language })
      });
      const data = await r.json().catch(()=>({ reply:"(sin JSON válido del upstream)" }));
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data)
      };
    }

    // Fallback demo
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ reply: `Recibido: "${message}". (demo local)` })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: String(e) })
    };
  }
};
