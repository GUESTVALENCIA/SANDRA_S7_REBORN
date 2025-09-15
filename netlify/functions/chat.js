const fetch = global.fetch;

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body || "{}");
    if(!text) return { statusCode: 400, body: JSON.stringify({ error:"Missing text" }) };

    const UPSTREAM_API_URL = process.env.UPSTREAM_API_URL; // <-- https://api.guestsvalencia.es/sandra/v7
    const UPSTREAM_API_KEY = process.env.UPSTREAM_API_KEY;

    // Asumo POST JSON → {prompt:text} y {reply:"..."} como respuesta
    const r = await fetch(UPSTREAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Authorization": `Bearer ${UPSTREAM_API_KEY}`
      },
      body: JSON.stringify({ prompt: text })
    });

    if(!r.ok){
      const msg = await r.text();
      return { statusCode: 502, body: JSON.stringify({ error:"Upstream error", detail: msg }) };
    }

    const data = await r.json();
    // Normaliza a {reply:"..."}
    const reply = data.reply || data.text || data.message || "…";
    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error:e.message }) };
  }
};
