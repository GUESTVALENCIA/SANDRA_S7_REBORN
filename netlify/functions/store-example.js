// netlify/functions/store-example.js - PERSISTENCIA NEON (GPT-5 INSTRUCTIONS)
// npm i pg (en package.json)
import { Client } from 'pg';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || "https://guestsvalencia.es,https://*.guestsvalencia.es,https://claytomsystems.com,https://*.claytomsystems.com,https://*.netlify.app,http://localhost:8888",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sandra-Key',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders() };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };

  // Opcional: exigir clave si es training
  if (String(process.env.TRAINING_ENABLED || 'false') === 'true') {
    const k = event.headers['x-sandra-key'] || event.headers['X-Sandra-Key'];
    if (!k || k !== process.env.TRAINING_API_KEY) return { statusCode: 401, headers: corsHeaders(), body: 'Unauthorized' };
  }

  let ex;
  try {
    ex = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders(), body: 'Bad JSON' };
  }

  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
  await client.connect();

  await client.query(`
    create table if not exists sandra_examples (
      id bigserial primary key,
      created_at timestamptz default now(),
      persona text not null,
      loras   jsonb not null,
      input   text not null,
      output  text not null
    )
  `);

  await client.query(
    `insert into sandra_examples(persona, loras, input, output) values($1,$2,$3,$4)`,
    [ex.persona || 'developer', JSON.stringify(ex.loras || []), ex.input || '', ex.output || '']
  );

  await client.end();

  return {
    statusCode: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true })
  };
}