// netlify/functions/heygen-share.js
// Crea enlace embebible para avatar HeyGen

export const handler = async (event) => {
  const allow = process.env.ALLOW_ORIGIN || "*";

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: cors(allow),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(allow), body: "Method Not Allowed" };
  }

  try {
    const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

    if (!HEYGEN_API_KEY) {
      // Fallback demo si no hay API key
      return {
        statusCode: 200,
        headers: cors(allow),
        body: JSON.stringify({
          data: {
            url: "https://app.heygen.com/embeds/06a5c3b4bbaf4659ab5be1cbfc11e2a4"
          }
        }),
      };
    }

    const { video_id } = JSON.parse(event.body || "{}");
    const videoId = video_id || "06a5c3b4bbaf4659ab5be1cbfc11e2a4"; // default

    const response = await fetch(`https://api.heygen.com/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_id: videoId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: cors(allow),
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: cors(allow),
      body: JSON.stringify({ error: `Server error: ${e.message}` }),
    };
  }
};

function cors(allow) {
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
  };
}