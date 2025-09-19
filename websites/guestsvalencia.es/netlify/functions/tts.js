// TTS minimal optimizado - ElevenLabs v2.5 - OLA 2.1
const https = require('https');

exports.handler = async (event) => {
  // CORS simple
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text } = JSON.parse(event.body || '{}');
    if (!text) {
      return {
        statusCode: 400,
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Text required' })
      };
    }

    const audioBuffer = await generateTTS(text);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'content-type': 'audio/mpeg',
        'cache-control': 'no-cache'
      },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

function generateTTS(text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      output_format: "mp3_44100_128",
      voice_settings: { stability: 0.5, similarity_boost: 0.8 }
    });

    const req = https.request({
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`ElevenLabs error: ${res.statusCode}`));
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