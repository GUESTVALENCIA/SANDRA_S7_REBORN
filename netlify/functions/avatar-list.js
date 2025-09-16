// netlify/functions/avatar-list.js
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
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
    // Get available avatars
    const avatarResponse = await fetch("https://api.heygen.com/v1/streaming/avatar.list", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${HEYGEN_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!avatarResponse.ok) {
      const errorText = await avatarResponse.text();
      return {
        statusCode: 502,
        body: JSON.stringify({ error: `HeyGen avatars error: ${errorText}` }),
        headers: { "Access-Control-Allow-Origin": ALLOW_ORIGIN }
      };
    }

    const avatarData = await avatarResponse.json();
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOW_ORIGIN
      },
      body: JSON.stringify({
        success: true,
        avatars: avatarData.data || [],
        message: "Avatars retrieved successfully"
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
