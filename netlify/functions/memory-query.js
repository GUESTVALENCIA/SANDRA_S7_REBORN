// netlify/functions/memory-query.js - CONSULTA INTELIGENTE DE MEMORIA SANDRA
import { Client } from 'pg';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || "https://guestsvalencia.es,https://*.guestsvalencia.es,https://claytomsystems.com,https://*.claytomsystems.com,https://*.netlify.app,http://localhost:8888",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sandra-Key, X-Persona, X-Session-Id',
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders() };

  try {
    const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
    await client.connect();

    const persona = event.headers['x-persona'] || 'developer';
    const sessionId = event.headers['x-session-id'] || null;

    if (event.httpMethod === 'GET') {
      // CONSULTAR MEMORIA EXISTENTE
      const queryType = new URLSearchParams(event.queryStringParameters || {}).get('type') || 'recent';
      const limit = parseInt(new URLSearchParams(event.queryStringParameters || {}).get('limit') || '10');

      let query = '';
      let params = [];

      switch (queryType) {
        case 'recent':
          // Conversaciones recientes
          query = `
            SELECT user_message, sandra_response, created_at, context
            FROM sandra_conversations
            WHERE persona = $1
            ${sessionId ? 'AND session_id = $2' : ''}
            ORDER BY created_at DESC
            LIMIT $${sessionId ? '3' : '2'}
          `;
          params = sessionId ? [persona, sessionId, limit] : [persona, limit];
          break;

        case 'memory':
          // Memoria a largo plazo más relevante
          query = `
            SELECT memory_type, content, tags, relevance_score, created_at
            FROM sandra_memory
            WHERE persona = $1
            ORDER BY relevance_score DESC, created_at DESC
            LIMIT $2
          `;
          params = [persona, limit];
          break;

        case 'training':
          // Ejemplos de entrenamiento recientes
          query = `
            SELECT input, output, loras, created_at, context
            FROM sandra_examples
            WHERE persona = $1
            ORDER BY created_at DESC
            LIMIT $2
          `;
          params = [persona, limit];
          break;

        case 'context':
          // Contexto completo para la sesión actual
          if (!sessionId) {
            return {
              statusCode: 400,
              headers: corsHeaders(),
              body: JSON.stringify({ error: 'Session ID required for context query' })
            };
          }

          query = `
            SELECT user_message, sandra_response, created_at, context
            FROM sandra_conversations
            WHERE session_id = $1
            ORDER BY created_at ASC
          `;
          params = [sessionId];
          break;

        default:
          return {
            statusCode: 400,
            headers: corsHeaders(),
            body: JSON.stringify({ error: 'Invalid query type. Use: recent, memory, training, context' })
          };
      }

      const result = await client.query(query, params);
      await client.end();

      return {
        statusCode: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          type: queryType,
          persona: persona,
          session_id: sessionId,
          count: result.rows.length,
          data: result.rows
        })
      };

    } else if (event.httpMethod === 'POST') {
      // AGREGAR A MEMORIA A LARGO PLAZO
      const body = JSON.parse(event.body || '{}');

      if (!body.content || !body.memory_type) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Content and memory_type required' })
        };
      }

      await client.query(
        `INSERT INTO sandra_memory(memory_type, content, persona, tags, relevance_score)
         VALUES($1, $2, $3, $4, $5)`,
        [
          body.memory_type,
          body.content,
          persona,
          JSON.stringify(body.tags || []),
          body.relevance_score || 1.0
        ]
      );

      await client.end();

      return {
        statusCode: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Memoria agregada exitosamente',
          persona: persona
        })
      };
    }

  } catch (error) {
    console.error('Memory query error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error en consulta de memoria',
        details: error.message
      })
    };
  }
}