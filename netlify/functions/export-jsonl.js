// netlify/functions/export-jsonl.js - EXPORTAR MEMORIA SANDRA EN FORMATO JSONL
import { Client } from 'pg';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || "https://guestsvalencia.es,https://*.guestsvalencia.es,https://claytomsystems.com,https://*.claytomsystems.com,https://*.netlify.app,http://localhost:8888",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sandra-Key',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders() };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };

  // Verificar autorización
  if (process.env.TRAINING_ENABLED === "true") {
    const k = event.headers['x-sandra-key'] || event.headers['X-Sandra-Key'];
    if (!k || k !== process.env.TRAINING_API_KEY) {
      return { statusCode: 401, headers: corsHeaders(), body: 'Unauthorized' };
    }
  }

  try {
    const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
    await client.connect();

    // Parámetros de consulta
    const queryParams = new URLSearchParams(event.queryStringParameters || {});
    const persona = queryParams.get('persona') || 'all';
    const limit = parseInt(queryParams.get('limit') || '1000');
    const format = queryParams.get('format') || 'training'; // 'training', 'conversations', 'memory'

    let query = '';
    let params = [];

    switch (format) {
      case 'training':
        query = `
          SELECT persona, input, output, loras, created_at, context, metadata
          FROM sandra_examples
          ${persona !== 'all' ? 'WHERE persona = $1' : ''}
          ORDER BY created_at DESC
          LIMIT $${persona !== 'all' ? '2' : '1'}
        `;
        params = persona !== 'all' ? [persona, limit] : [limit];
        break;

      case 'conversations':
        query = `
          SELECT session_id, user_message as input, sandra_response as output, persona, created_at, context
          FROM sandra_conversations
          ${persona !== 'all' ? 'WHERE persona = $1' : ''}
          ORDER BY created_at DESC
          LIMIT $${persona !== 'all' ? '2' : '1'}
        `;
        params = persona !== 'all' ? [persona, limit] : [limit];
        break;

      case 'memory':
        query = `
          SELECT memory_type, content, persona, tags, relevance_score, created_at
          FROM sandra_memory
          ${persona !== 'all' ? 'WHERE persona = $1' : ''}
          ORDER BY relevance_score DESC, created_at DESC
          LIMIT $${persona !== 'all' ? '2' : '1'}
        `;
        params = persona !== 'all' ? [persona, limit] : [limit];
        break;

      default:
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: 'Invalid format. Use: training, conversations, or memory'
        };
    }

    const result = await client.query(query, params);
    await client.end();

    // Convertir a JSONL
    let jsonlLines = [];

    if (format === 'training') {
      jsonlLines = result.rows.map(row => JSON.stringify({
        messages: [
          { role: "user", content: row.input },
          { role: "assistant", content: row.output }
        ],
        persona: row.persona,
        loras: row.loras,
        metadata: {
          created_at: row.created_at,
          context: row.context,
          training_metadata: row.metadata
        }
      }));
    } else if (format === 'conversations') {
      jsonlLines = result.rows.map(row => JSON.stringify({
        session_id: row.session_id,
        messages: [
          { role: "user", content: row.input },
          { role: "assistant", content: row.output }
        ],
        persona: row.persona,
        timestamp: row.created_at,
        context: row.context
      }));
    } else if (format === 'memory') {
      jsonlLines = result.rows.map(row => JSON.stringify({
        type: row.memory_type,
        content: row.content,
        persona: row.persona,
        tags: row.tags,
        relevance: row.relevance_score,
        timestamp: row.created_at
      }));
    }

    const jsonlContent = jsonlLines.join('\n');
    const filename = `sandra_${format}_${persona}_${new Date().toISOString().split('T')[0]}.jsonl`;

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/x-jsonlines',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Total-Records': result.rows.length.toString()
      },
      body: jsonlContent
    };

  } catch (error) {
    console.error('Export error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error al exportar datos',
        details: error.message
      })
    };
  }
}