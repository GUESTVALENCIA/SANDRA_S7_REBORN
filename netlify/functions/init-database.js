// netlify/functions/init-database.js - INICIALIZACIÓN COMPLETA NEON DATABASE
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

  // Solo permitir GET para inicialización
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };

  try {
    const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
    await client.connect();

    // ESQUEMA COMPLETO PARA MEMORIA SANDRA IA 7.0
    await client.query(`
      -- Tabla principal para ejemplos de entrenamiento
      CREATE TABLE IF NOT EXISTS sandra_examples (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        persona TEXT NOT NULL DEFAULT 'developer',
        loras JSONB NOT NULL DEFAULT '[]'::jsonb,
        input TEXT NOT NULL,
        output TEXT NOT NULL,
        context JSONB DEFAULT '{}'::jsonb,
        metadata JSONB DEFAULT '{}'::jsonb,
        INDEX(created_at),
        INDEX(persona)
      );

      -- Tabla para conversaciones completas
      CREATE TABLE IF NOT EXISTS sandra_conversations (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        sandra_response TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        persona TEXT DEFAULT 'developer',
        context JSONB DEFAULT '{}'::jsonb,
        INDEX(session_id),
        INDEX(created_at),
        INDEX(persona)
      );

      -- Tabla para memoria a largo plazo
      CREATE TABLE IF NOT EXISTS sandra_memory (
        id BIGSERIAL PRIMARY KEY,
        memory_type TEXT NOT NULL, -- 'fact', 'preference', 'context', 'skill'
        content TEXT NOT NULL,
        relevance_score FLOAT DEFAULT 1.0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        persona TEXT DEFAULT 'developer',
        tags JSONB DEFAULT '[]'::jsonb,
        INDEX(memory_type),
        INDEX(persona),
        INDEX(relevance_score),
        INDEX(created_at)
      );

      -- Tabla para configuraciones por persona
      CREATE TABLE IF NOT EXISTS sandra_personas (
        id BIGSERIAL PRIMARY KEY,
        persona_name TEXT UNIQUE NOT NULL,
        configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
        voice_settings JSONB DEFAULT '{}'::jsonb,
        behavior_settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Insertar personas por defecto si no existen
      INSERT INTO sandra_personas (persona_name, configuration, voice_settings, behavior_settings)
      VALUES
        ('developer',
         '{"role": "Asistente técnico especializado en desarrollo"}',
         '{"voice_id": "Rachel", "stability": 0.5, "similarity_boost": 0.7}',
         '{"temperature": 0.7, "max_tokens": 150, "professional_tone": true}'
        ),
        ('reception',
         '{"role": "Recepcionista virtual para hoteles y servicios"}',
         '{"voice_id": "Bella", "stability": 0.6, "similarity_boost": 0.8}',
         '{"temperature": 0.8, "max_tokens": 200, "friendly_tone": true}'
        ),
        ('sales',
         '{"role": "Especialista en ventas y atención comercial"}',
         '{"voice_id": "Rachel", "stability": 0.7, "similarity_boost": 0.9}',
         '{"temperature": 0.9, "max_tokens": 250, "persuasive_tone": true}'
        ),
        ('support',
         '{"role": "Soporte técnico y atención al cliente"}',
         '{"voice_id": "Grace", "stability": 0.5, "similarity_boost": 0.7}',
         '{"temperature": 0.6, "max_tokens": 180, "helpful_tone": true}'
        )
      ON CONFLICT (persona_name) DO NOTHING;
    `);

    await client.end();

    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Base de datos Neon inicializada correctamente para Sandra IA 7.0',
        tables: ['sandra_examples', 'sandra_conversations', 'sandra_memory', 'sandra_personas']
      })
    };

  } catch (error) {
    console.error('Database initialization error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error al inicializar base de datos',
        details: error.message
      })
    };
  }
}