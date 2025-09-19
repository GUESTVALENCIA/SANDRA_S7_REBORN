const https = require('https');

// CORS helper
function getCorsHeaders(origin) {
  const allowedOrigins = (process.env.ALLOW_ORIGIN || '').split(',').map(o => o.trim());
  const isAllowed = allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : (allowedOrigins[0] || 'null'),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

// ElevenLabs TTS
async function textToSpeech(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const payload = JSON.stringify({
    text: text,
    model_id: "eleven_turbo_v2_5",
    output_format: "mp3_44100_128",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true
    }
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`ElevenLabs API error: ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async (event, context) => {
  const origin = event.headers.origin || '';
  const corsHeaders = getCorsHeaders(origin);

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text, mode } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    // Add context based on mode
    let contextualText = text;
    if (mode === 'reception') {
      contextualText = `Como recepcionista de Guests Valencia: ${text}`;
    } else if (mode === 'owners') {
      contextualText = `Como asistente para propietarios de Guests Valencia: ${text}`;
    }

    // Generate TTS
    const audioBuffer = await textToSpeech(contextualText);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache'
      },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('TTS Error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'TTS service error',
        message: error.message
      })
    };
  }
};