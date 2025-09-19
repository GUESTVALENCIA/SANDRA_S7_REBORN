// netlify/functions/proxy-openai.js - Proxy personalizado para OpenAI con LoRAs
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
    const {
      messages,
      model = 'gpt-4o-mini',
      persona = 'reception',
      lora = null,
      temperature = 0.7,
      max_tokens = 1000
    } = JSON.parse(event.body || '{}');

    // Validar entrada
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Se requiere un array de mensajes',
          format: {
            messages: [
              { role: 'user', content: 'mensaje del usuario' }
            ],
            persona: 'reception|sales|support|developer',
            lora: 'meta.loras.reception.trained_model_id'
          }
        })
      };
    }

    // Obtener API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'OpenAI API key no configurada' })
      };
    }

    // Construir system prompt personalizado según persona
    const systemPrompts = {
      reception: 'Eres Sandra, la recepcionista virtual de Guests Valencia. Eres amable, profesional y experta en ayudar con reservas de alojamientos turísticos en Valencia. Siempre preguntas por fechas, número de huéspedes y preferencias.',
      sales: 'Eres Sandra, especialista en ventas de Guests Valencia. Eres persuasiva pero nunca agresiva, destacas los beneficios únicos de nuestros alojamientos y buscas cerrar reservas.',
      support: 'Eres Sandra, del equipo de soporte de Guests Valencia. Resuelves problemas técnicos, dudas sobre el check-in, amenidades y cualquier inconveniente durante la estancia.',
      developer: 'Eres Sandra, asistente técnica especializada en desarrollo. Ayudas con integraciones, APIs, configuraciones técnicas y debugging de sistemas.'
    };

    // Preparar mensajes con system prompt personalizado
    const systemPrompt = systemPrompts[persona] || systemPrompts.reception;
    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Si hay LoRA especificado, ajustar el modelo
    let finalModel = model;
    if (lora && lora.startsWith('meta.loras.')) {
      // En una implementación real, aquí se usaría el modelo fine-tuned
      console.log(`[PROXY-OPENAI] Usando LoRA: ${lora}`);
      // finalModel = lora; // Por ahora usamos el modelo base
    }

    // Llamada a OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: finalModel,
        messages: finalMessages,
        temperature: temperature,
        max_tokens: max_tokens,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Error en OpenAI API',
          details: errorData
        })
      };
    }

    const data = await response.json();

    // Añadir metadata personalizada
    const customResponse = {
      ...data,
      sandra_metadata: {
        persona: persona,
        lora_used: lora,
        model_used: finalModel,
        processing_time: new Date().toISOString()
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(customResponse)
    };

  } catch (error) {
    console.error('Error en proxy OpenAI:', error);
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