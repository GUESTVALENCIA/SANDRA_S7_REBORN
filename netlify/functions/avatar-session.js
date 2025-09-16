// netlify/functions/avatar-session.js
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!HEYGEN_API_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "HeyGen API key not configured" }),
      headers: { "Access-Control-Allow-Origin": ALLOW_ORIGIN }
    };
  }

  try {
    // Create session token
    const tokenResponse = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HEYGEN_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return {
        statusCode: 502,
        body: JSON.stringify({ error: `HeyGen token error: ${errorText}` }),
        headers: { "Access-Control-Allow-Origin": ALLOW_ORIGIN }
      };
    }

    const tokenData = await tokenResponse.json();
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOW_ORIGIN
      },
      body: JSON.stringify({
        success: true,
        token: tokenData.data?.token,
        message: "Session token created successfully"
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${error.message}` }),
      headers: { "Access-Control-Allow-Origin": ALLOW_ORIGIN }
    };
  }
};
