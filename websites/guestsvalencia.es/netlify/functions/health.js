// Health check minimal optimizado - OLA 2.1
exports.handler = async () => ({
  statusCode: 200,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-cache'
  },
  body: JSON.stringify({
    ok: true,
    service: 'guestsvalencia',
    timestamp: new Date().toISOString(),
    env: {
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      voice_id: !!process.env.ELEVENLABS_VOICE_ID
    }
  })
});