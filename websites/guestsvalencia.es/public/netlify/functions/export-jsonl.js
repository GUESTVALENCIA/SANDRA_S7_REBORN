// netlify/functions/export-jsonl.js - Exportar dataset en formato JSONL
exports.handler = async (event, context) => {
  // Manejo de CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'GET') {
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
    // Obtener parámetros de query
    const params = event.queryStringParameters || {};
    const persona = params.persona || 'all';
    const format = params.format || 'openai';

    // En una implementación real, aquí se obtendría de la base de datos
    // Por ahora, generamos ejemplos de muestra

    const sampleExamples = [
      {
        input: '¿Tienes disponibilidad para este fin de semana?',
        output: 'Claro, déjame revisar nuestras disponibilidades. ¿Para cuántas personas y qué fechas específicas necesitas?'
      },
      {
        input: 'Me gustaría reservar un apartamento cerca de la playa',
        output: 'Perfecto! Tenemos hermosos apartamentos cerca de la Playa de la Malvarosa. ¿Cuáles son tus fechas de viaje?'
      },
      {
        input: '¿Qué incluye el alojamiento?',
        output: 'Nuestros alojamientos incluyen WiFi gratuito, ropa de cama, toallas, cocina equipada y acceso 24/7. ¿Hay algo específico que te gustaría saber?'
      },
      {
        input: 'Tengo una pregunta sobre el check-in',
        output: 'Por supuesto, estaré encantada de ayudarte con el check-in. ¿Qué necesitas saber específicamente?'
      },
      {
        input: '¿Hay parking disponible?',
        output: 'Muchos de nuestros alojamientos incluyen parking. ¿En qué zona de Valencia estás interesado? Así puedo darte información específica.'
      }
    ];

    let jsonlData = '';

    if (format === 'openai') {
      // Formato para fine-tuning de OpenAI
      sampleExamples.forEach(example => {
        const jsonlLine = {
          messages: [
            {
              role: 'system',
              content: 'Eres Sandra, la asistente virtual de Guests Valencia. Eres amable, profesional y ayudas con reservas de alojamientos turísticos en Valencia.'
            },
            {
              role: 'user',
              content: example.input
            },
            {
              role: 'assistant',
              content: example.output
            }
          ]
        };
        jsonlData += JSON.stringify(jsonlLine) + '\n';
      });
    } else {
      // Formato simple
      sampleExamples.forEach(example => {
        const jsonlLine = {
          input: example.input,
          output: example.output,
          persona: persona === 'all' ? 'reception' : persona
        };
        jsonlData += JSON.stringify(jsonlLine) + '\n';
      });
    }

    // Generar filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `sandra-dataset-${persona}-${timestamp}.jsonl`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/jsonl',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Disposition'
      },
      body: jsonlData
    };

  } catch (error) {
    console.error('Error exportando JSONL:', error);
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