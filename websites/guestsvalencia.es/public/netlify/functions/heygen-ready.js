// netlify/functions/heygen-ready.js
exports.handler = async (event, context) => {
  try {
    // Verificar si HeyGen está habilitado
    const heygenApiKey = process.env.HEYGEN_API_KEY;
    const heygenEnabled = !!heygenApiKey;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        enabled: heygenEnabled,
        message: heygenEnabled ? 'HeyGen habilitado' : 'HeyGen no configurado'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        enabled: false,
        error: 'Error verificando HeyGen'
      })
    };
  }
};