// Netlify Function: /token/realtime
// Returns a short-lived token (demo). Replace with your real issuance if needed.

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
  const token = "ephemeral_dummy_token";
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ token, expires_in: 60 })
  };
};
