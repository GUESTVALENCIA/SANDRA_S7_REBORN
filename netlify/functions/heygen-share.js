// Creates/returns a share URL for an avatar video (proxy). Falls back to a demo link.
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}, body: "" };
  try {
    const API_KEY = process.env.HEYGEN_API_KEY;
    const { video_id } = JSON.parse(event.body || "{}");
    if (!API_KEY) {
      // Fallback demo
      return {
        statusCode: 200,
        headers: { ...{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}, "Content-Type":"application/json" },
        body: JSON.stringify({ url: "https://labs.heygen.com/share/DEMO_VIDEO_ID" })
      };
    }
    // Example call (replace with the correct endpoint for your account)
    const resp = await fetch("https://api.heygen.com/v1/video_shares", {
      method:"POST",
      headers: { "Content-Type":"application/json", "x-api-key": API_KEY },
      body: JSON.stringify({ video_id: video_id || "DEMO_VIDEO_ID" })
    });
    const data = await resp.json();
    return {
      statusCode: 200,
      headers: { ...{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}, "Content-Type":"application/json" },
      body: JSON.stringify(data)
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
