// netlify/functions/avatar-session.js - CORRECCIÓN SEGÚN DOCS OFICIALES HEYGEN
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";

// Cache de sesiones (reduce timeouts y memoria)
let sessionCache = {
  session_id: null,
  access_token: null,
  url: null,
  expires: 0
};

// Fetch con timeout para evitar 4000ms+
const fetchWithTimeout = (url, options, timeout = 3000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('HeyGen timeout')), timeout)
    )
  ]);
};

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  if (!HEYGEN_API_KEY) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: "HeyGen API key not configured" })
    };
  }

  try {
    // Verificar cache (evita llamadas innecesarias)
    const now = Date.now();
    if (sessionCache.session_id && sessionCache.expires > now) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          session_id: sessionCache.session_id,
          access_token: sessionCache.access_token,
          url: sessionCache.url,
          cached: true
        })
      };
    }

    // ENDPOINT CORRECTO SEGÚN DOCS: /v1/streaming.new
    const sessionResponse = await fetchWithTimeout(
      "https://api.heygen.com/v1/streaming.new",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HEYGEN_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quality: "medium", // Reduce memoria vs "high"
          disable_idle_timeout: false // Permite timeout para liberar recursos
        })
      },
      2500 // Timeout agresivo para evitar 4000ms+
    );

    if (!sessionResponse.ok) {
      throw new Error(`HeyGen API error: ${sessionResponse.status}`);
    }

    const sessionData = await sessionResponse.json();
    
    if (!sessionData.data?.session_id) {
      throw new Error("Invalid session response");
    }

    // Cache por 10 minutos (balancea performance vs recursos)
    sessionCache = {
      session_id: sessionData.data.session_id,
      access_token: sessionData.data.access_token,
      url: sessionData.data.url,
      expires: now + 600000 // 10 minutos
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        session_id: sessionData.data.session_id,
        access_token: sessionData.data.access_token,
        url: sessionData.data.url,
        cached: false
      })
    };

  } catch (error) {
    console.error('Avatar session error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Session creation failed",
        success: false
      })
    };
  }
};
