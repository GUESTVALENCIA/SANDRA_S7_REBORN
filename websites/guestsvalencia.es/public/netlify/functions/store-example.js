// netlify/functions/store-example.js - Almacenar ejemplos de entrenamiento
exports.handler = async (event, context) => {
  // Manejo de CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { input, output, persona = 'reception', metadata = {} } = JSON.parse(event.body || '{}');

    // Validar entrada
    if (!input || !output) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Se requieren los campos input y output',
          format: {
            input: 'Pregunta o mensaje del usuario',
            output: 'Respuesta esperada de Sandra',
            persona: 'reception|sales|support|developer',
            metadata: { category: 'booking', priority: 'high' }
          }
        })
      };
    }

    // Crear ejemplo
    const example = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      input: input.trim(),
      output: output.trim(),
      persona: persona,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
        source: 'manual_entry',
        validated: false
      }
    };

    // En una implementación real, aquí se almacenaría en base de datos
    // Por ahora, simulamos el almacenamiento

    // Log para desarrollo
    console.log(`[STORE-EXAMPLE] Guardado ejemplo para persona ${persona}:`, {
      input: input.substring(0, 50) + '...',
      output: output.substring(0, 50) + '...'
    });

    // Simular respuesta de almacenamiento exitoso
    const result = {
      success: true,
      example_id: example.id,
      persona: example.persona,
      stored_at: example.metadata.created_at,
      message: 'Ejemplo almacenado exitosamente',
      total_examples: Math.floor(Math.random() * 1000) + 1, // Simular contador
      dataset_path: `datasets/${persona}.jsonl`
    };

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error almacenando ejemplo:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message
      })
    };
  }
};