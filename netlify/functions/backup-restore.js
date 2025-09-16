// netlify/functions/backup-restore.js - SISTEMA DE RESPALDO Y RECUPERACIÓN SANDRA
import { Client } from 'pg';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || "https://guestsvalencia.es,https://*.guestsvalencia.es,https://claytomsystems.com,https://*.claytomsystems.com,https://*.netlify.app,http://localhost:8888",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sandra-Key',
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders() };

  // Verificar autorización admin
  if (process.env.TRAINING_ENABLED === "true") {
    const k = event.headers['x-sandra-key'] || event.headers['X-Sandra-Key'];
    if (!k || k !== process.env.TRAINING_API_KEY) {
      return { statusCode: 401, headers: corsHeaders(), body: 'Unauthorized' };
    }
  }

  try {
    const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
    await client.connect();

    const operation = new URLSearchParams(event.queryStringParameters || {}).get('operation') || 'backup';

    if (operation === 'backup') {
      // CREAR RESPALDO COMPLETO
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '7.0',
        tables: {}
      };

      // Respaldar ejemplos de entrenamiento
      const examples = await client.query('SELECT * FROM sandra_examples ORDER BY created_at');
      backupData.tables.sandra_examples = examples.rows;

      // Respaldar conversaciones (últimos 30 días)
      const conversations = await client.query(`
        SELECT * FROM sandra_conversations
        WHERE created_at >= NOW() - INTERVAL '30 days'
        ORDER BY created_at
      `);
      backupData.tables.sandra_conversations = conversations.rows;

      // Respaldar memoria a largo plazo
      const memory = await client.query('SELECT * FROM sandra_memory ORDER BY relevance_score DESC');
      backupData.tables.sandra_memory = memory.rows;

      // Respaldar configuraciones de personas
      const personas = await client.query('SELECT * FROM sandra_personas ORDER BY persona_name');
      backupData.tables.sandra_personas = personas.rows;

      await client.end();

      const filename = `sandra_backup_${new Date().toISOString().split('T')[0]}.json`;

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        },
        body: JSON.stringify(backupData, null, 2)
      };

    } else if (operation === 'restore') {
      // RESTAURAR DESDE RESPALDO
      if (event.httpMethod !== 'POST') {
        return {
          statusCode: 405,
          headers: corsHeaders(),
          body: 'POST required for restore operation'
        };
      }

      const backupData = JSON.parse(event.body || '{}');

      if (!backupData.tables) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Invalid backup format' })
        };
      }

      let restored = { tables: {}, errors: [] };

      // Restaurar ejemplos
      if (backupData.tables.sandra_examples) {
        try {
          for (const example of backupData.tables.sandra_examples) {
            await client.query(
              `INSERT INTO sandra_examples(persona, loras, input, output, context, metadata, created_at)
               VALUES($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT DO NOTHING`,
              [
                example.persona,
                example.loras,
                example.input,
                example.output,
                example.context,
                example.metadata,
                example.created_at
              ]
            );
          }
          restored.tables.sandra_examples = backupData.tables.sandra_examples.length;
        } catch (err) {
          restored.errors.push(`Examples: ${err.message}`);
        }
      }

      // Restaurar conversaciones
      if (backupData.tables.sandra_conversations) {
        try {
          for (const conv of backupData.tables.sandra_conversations) {
            await client.query(
              `INSERT INTO sandra_conversations(session_id, user_message, sandra_response, persona, context, created_at)
               VALUES($1, $2, $3, $4, $5, $6)
               ON CONFLICT DO NOTHING`,
              [
                conv.session_id,
                conv.user_message,
                conv.sandra_response,
                conv.persona,
                conv.context,
                conv.created_at
              ]
            );
          }
          restored.tables.sandra_conversations = backupData.tables.sandra_conversations.length;
        } catch (err) {
          restored.errors.push(`Conversations: ${err.message}`);
        }
      }

      // Restaurar memoria
      if (backupData.tables.sandra_memory) {
        try {
          for (const mem of backupData.tables.sandra_memory) {
            await client.query(
              `INSERT INTO sandra_memory(memory_type, content, persona, tags, relevance_score, created_at, updated_at)
               VALUES($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT DO NOTHING`,
              [
                mem.memory_type,
                mem.content,
                mem.persona,
                mem.tags,
                mem.relevance_score,
                mem.created_at,
                mem.updated_at
              ]
            );
          }
          restored.tables.sandra_memory = backupData.tables.sandra_memory.length;
        } catch (err) {
          restored.errors.push(`Memory: ${err.message}`);
        }
      }

      // Restaurar personas
      if (backupData.tables.sandra_personas) {
        try {
          for (const persona of backupData.tables.sandra_personas) {
            await client.query(
              `INSERT INTO sandra_personas(persona_name, configuration, voice_settings, behavior_settings, created_at, updated_at)
               VALUES($1, $2, $3, $4, $5, $6)
               ON CONFLICT (persona_name) DO UPDATE SET
               configuration = EXCLUDED.configuration,
               voice_settings = EXCLUDED.voice_settings,
               behavior_settings = EXCLUDED.behavior_settings,
               updated_at = NOW()`,
              [
                persona.persona_name,
                persona.configuration,
                persona.voice_settings,
                persona.behavior_settings,
                persona.created_at,
                persona.updated_at
              ]
            );
          }
          restored.tables.sandra_personas = backupData.tables.sandra_personas.length;
        } catch (err) {
          restored.errors.push(`Personas: ${err.message}`);
        }
      }

      await client.end();

      return {
        statusCode: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          operation: 'restore',
          restored: restored,
          backup_timestamp: backupData.timestamp
        })
      };

    } else if (operation === 'stats') {
      // ESTADÍSTICAS DE LA BASE DE DATOS
      const stats = {};

      const exampleCount = await client.query('SELECT COUNT(*), persona FROM sandra_examples GROUP BY persona');
      stats.training_examples = exampleCount.rows;

      const convCount = await client.query('SELECT COUNT(*), persona FROM sandra_conversations GROUP BY persona');
      stats.conversations = convCount.rows;

      const memCount = await client.query('SELECT COUNT(*), memory_type, persona FROM sandra_memory GROUP BY memory_type, persona');
      stats.memory_entries = memCount.rows;

      const totalSize = await client.query(`
        SELECT
          pg_size_pretty(pg_total_relation_size('sandra_examples')) as examples_size,
          pg_size_pretty(pg_total_relation_size('sandra_conversations')) as conversations_size,
          pg_size_pretty(pg_total_relation_size('sandra_memory')) as memory_size,
          pg_size_pretty(pg_total_relation_size('sandra_personas')) as personas_size
      `);
      stats.storage = totalSize.rows[0];

      await client.end();

      return {
        statusCode: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          operation: 'stats',
          timestamp: new Date().toISOString(),
          statistics: stats
        })
      };

    } else {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid operation. Use: backup, restore, stats' })
      };
    }

  } catch (error) {
    console.error('Backup/Restore error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error en operación de respaldo/restauración',
        details: error.message
      })
    };
  }
}