// netlify/functions/heygen-embed.js
// Sirve el embed URL sin exponer claves

export const handler = async () => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "*",
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  },
  body: JSON.stringify({ url: process.env.HEYGEN_EMBED_URL || "" })
});