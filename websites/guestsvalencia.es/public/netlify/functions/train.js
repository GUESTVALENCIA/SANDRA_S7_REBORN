// netlify/functions/train.js - Endpoint de entrenamiento automático
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
    const { examples, persona = 'reception' } = JSON.parse(event.body || '{}');

    // Validar entrada
    if (!examples || !Array.isArray(examples)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Se requiere un array de ejemplos',
          format: {
            examples: [
              { input: 'pregunta del usuario', output: 'respuesta de sandra' }
            ]
          }
        })
      };
    }

    // Simular entrenamiento automático
    const trainingId = `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // En una implementación real, aquí se haría:
    // 1. Validar ejemplos de entrenamiento
    // 2. Formatear para la API de OpenAI
    // 3. Crear fine-tuning job
    // 4. Almacenar metadata en base de datos

    const trainingResult = {
      training_id: trainingId,
      status: 'started',
      persona: persona,
      examples_count: examples.length,
      estimated_completion: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
      message: 'Entrenamiento iniciado exitosamente',
      lora_path: `meta.loras.${persona}.${trainingId}`,
      created_at: new Date().toISOString()
    };

    // Log para desarrollo
    console.log(`[TRAIN] Iniciado entrenamiento para persona ${persona} con ${examples.length} ejemplos`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(trainingResult)
    };

  } catch (error) {
    console.error('Error en entrenamiento:', error);
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