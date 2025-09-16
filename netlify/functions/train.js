
// netlify/functions/train.js - ENTRENAMIENTO CON PERSISTENCIA NEON AUTOMÁTICA
import { Client } from 'pg';

function json(res, status=200){
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "https://guestsvalencia.es,https://*.guestsvalencia.es,https://claytomsystems.com,https://*.claytomsystems.com,https://*.netlify.app,http://localhost:8888",
      "Access-Control-Allow-Headers": "content-type, x-sandra-key",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(res)
  };
}

function corsHeaders(){
  return {
    "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "https://guestsvalencia.es,https://*.guestsvalencia.es,https://claytomsystems.com,https://*.claytomsystems.com,https://*.netlify.app,http://localhost:8888",
    "Access-Control-Allow-Headers": "content-type, x-sandra-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

export async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };

  try {
    const headers = corsHeaders();

    // Verificar autorización si está habilitada
    if (process.env.TRAINING_ENABLED === "true") {
      const k = event.headers["x-sandra-key"] || event.headers["X-Sandra-Key"];
      if (k !== process.env.TRAINING_API_KEY) {
        return { statusCode: 401, headers, body: "Unauthorized" };
      }
    }

    const body = JSON.parse(event.body || "{}");

    // Validar estructura mínima
    if (!body.input || !body.output) {
      return json({ error: "Bad Request: faltan campos input/output" }, 400);
    }

    // GUARDAR EN NEON AUTOMÁTICAMENTE
    if (process.env.NEON_DATABASE_URL) {
      try {
        const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
        await client.connect();

        // Insertar en tabla de ejemplos
        await client.query(
          `INSERT INTO sandra_examples(persona, loras, input, output, context, metadata)
           VALUES($1, $2, $3, $4, $5, $6)`,
          [
            body.persona || 'developer',
            JSON.stringify(body.loras || []),
            body.input,
            body.output,
            JSON.stringify(body.context || {}),
            JSON.stringify({
              training_source: 'frontend',
              user_session: context.clientContext?.user || 'anonymous',
              timestamp: new Date().toISOString()
            })
          ]
        );

        // También guardar en memoria a largo plazo si es relevante
        if (body.save_to_memory !== false) {
          await client.query(
            `INSERT INTO sandra_memory(memory_type, content, persona, tags, relevance_score)
             VALUES($1, $2, $3, $4, $5)`,
            [
              'training_example',
              `Input: ${body.input}\nOutput: ${body.output}`,
              body.persona || 'developer',
              JSON.stringify(body.tags || ['training', 'frontend']),
              body.relevance_score || 1.0
            ]
          );
        }

        await client.end();

        return json({
          ok: true,
          message: 'Ejemplo guardado en memoria de Sandra IA',
          saved_to_neon: true,
          persona: body.persona || 'developer'
        });

      } catch (dbError) {
        console.error('Error guardando en Neon:', dbError);
        return json({
          ok: true,
          message: 'Ejemplo recibido (error en base de datos)',
          saved_to_neon: false,
          error: dbError.message
        });
      }
    } else {
      // Sin Neon configurado
      return json({
        ok: true,
        message: 'Ejemplo recibido (sin persistencia - configurar NEON_DATABASE_URL)',
        saved_to_neon: false
      });
    }

  } catch (e) {
    return json({ error: e.message || String(e) }, 500);
  }
}
