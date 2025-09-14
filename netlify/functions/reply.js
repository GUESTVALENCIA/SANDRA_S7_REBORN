exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}, body: "" };
  try {
    const data = event.body ? JSON.parse(event.body) : {};
    const text = (data.text || "").toString().trim();
    const reply = text ? `Recibido: "${text}". (demo local)` : "Hola, soy Sandra (demo).";
    return {
      statusCode: 200,
      headers: { ...{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}, "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
},
      body: JSON.stringify({ error: e.message })
    };
  }
};
