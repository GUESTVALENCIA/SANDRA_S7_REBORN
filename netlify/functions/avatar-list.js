// netlify/functions/avatar-list.js - OPTIMIZADO CON MANEJO DE ERRORES
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";

// Cache de avatares (reduce memoria y timeouts)
let avatarCache = {
  data: null,
  expires: 0
};

// Fetch optimizado con timeout
const fetchWithTimeout = (url, options, timeout = 2000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Avatar list timeout')), timeout)
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

  if (event.httpMethod !== "GET") {
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
    // Cache hit - evita timeouts y reduce memoria
    const now = Date.now();
    if (avatarCache.data && avatarCache.expires > now) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          avatars: avatarCache.data,
          cached: true
        })
      };
    }

    // Llamada optimizada con timeout agresivo
    const avatarResponse = await fetchWithTimeout(
      "https://api.heygen.com/v1/streaming/avatar.list",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${HEYGEN_API_KEY}`,
          "Content-Type": "application/json"
        }
      },
      1500 // Timeout muy agresivo para evitar 4000ms+
    );

    if (!avatarResponse.ok) {
      // Manejo específico de errores HeyGen
      if (avatarResponse.status === 401) {
        throw new Error("Invalid HeyGen API key");
      }
      if (avatarResponse.status === 429) {
        throw new Error("Rate limit exceeded");
      }
      throw new Error(`HeyGen API error: ${avatarResponse.status}`);
    }

    const avatarData = await avatarResponse.json();
    
    if (!avatarData.data) {
      throw new Error("Invalid avatar data response");
    }

    // Cache por 30 minutos (avatares no cambian frecuentemente)
    avatarCache = {
      data: avatarData.data,
      expires: now + 1800000 // 30 minutos
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        avatars: avatarData.data,
        cached: false
      })
    };

  } catch (error) {
    console.error('Avatar list error:', error.message);
    
    // Fallback con avatar mock si hay error
    const fallbackAvatar = [{
      avatar_id: "default-avatar",
      name: "Sandra Default",
      gender: "female"
    }];

    return {
      statusCode: 200, // No fallar completamente
      headers,
      body: JSON.stringify({
        success: true,
        avatars: fallbackAvatar,
        fallback: true,
        error: error.message
      })
    };
  }
};
