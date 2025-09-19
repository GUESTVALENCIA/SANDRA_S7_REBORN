(function(){
  // WhatsApp cableado para Sandra y contacto
  const WA = '+34624829117';
  function waLink(msg){ return 'https://wa.me/'+WA.replace(/\D/g,'') + (msg?('?text='+encodeURIComponent(msg)):''); }

  // Opener 3s (opt-in)
  const playBtn = document.getElementById('play-opener');
  const audio = document.getElementById('opener-audio');
  if (playBtn && audio) playBtn.addEventListener('click', ()=>{ audio.currentTime=0; audio.play().catch(()=>{}); });

  // Barra fija contacto
  const waBtn = document.getElementById('cta-wa');
  if (waBtn) waBtn.href = waLink('Hola, quiero reservar.');

  // Barra de búsqueda → /search.html
  const form = document.getElementById('search-form');
  if (form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const qs = new URLSearchParams(Object.fromEntries(fd.entries())).toString();
      location.href = '/search.html?'+qs;
    });
  }

  // AI Búsqueda: Mini-llamada guiada con Sandra
  const aiHelpBtn = document.getElementById('ai-help');
  const aiPanel = document.getElementById('ai-search-panel');
  const aiSpeakBtn = document.getElementById('ai-speak-btn');
  const aiTypeBtn = document.getElementById('ai-type-btn');
  const aiCloseBtn = document.getElementById('ai-close-btn');
  const aiTextArea = document.getElementById('ai-text-area');
  const aiTextInput = document.getElementById('ai-text-input');
  const aiTextSend = document.getElementById('ai-text-send');
  const aiStatus = document.getElementById('ai-status');
  const aiResponse = document.getElementById('ai-response');
  const aiResponseText = document.getElementById('ai-response-text');

  let isRecording = false;
  let recognition = null;

  // Abrir panel de AI
  if (aiHelpBtn && aiPanel) {
    aiHelpBtn.addEventListener('click', () => {
      aiPanel.classList.toggle('hidden');
      if (!aiPanel.classList.contains('hidden')) {
        // Scroll al panel
        aiPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Cerrar panel
  if (aiCloseBtn && aiPanel) {
    aiCloseBtn.addEventListener('click', () => {
      aiPanel.classList.add('hidden');
      stopRecording();
      hideAllStates();
    });
  }

  // Botón hablar (voz)
  if (aiSpeakBtn) {
    aiSpeakBtn.addEventListener('click', startVoiceSearch);
  }

  // Botón escribir
  if (aiTypeBtn && aiTextArea) {
    aiTypeBtn.addEventListener('click', () => {
      hideAllStates();
      aiTextArea.classList.remove('hidden');
      aiTextInput?.focus();
    });
  }

  // Enviar texto
  if (aiTextSend && aiTextInput) {
    aiTextSend.addEventListener('click', () => {
      const text = aiTextInput.value.trim();
      if (text) {
        processAIQuery(text);
        aiTextInput.value = '';
      }
    });

    aiTextInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        aiTextSend.click();
      }
    });
  }

  function hideAllStates() {
    aiTextArea?.classList.add('hidden');
    aiStatus?.classList.add('hidden');
    aiResponse?.classList.add('hidden');
  }

  function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showAIResponse('❌ Tu navegador no soporta reconocimiento de voz. Usa el botón "Escribir" para continuar.');
      return;
    }

    hideAllStates();
    aiStatus?.classList.remove('hidden');

    try {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        isRecording = true;
        if (aiSpeakBtn) {
          aiSpeakBtn.innerHTML = '🔴 Grabando...';
          aiSpeakBtn.disabled = true;
        }
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processAIQuery(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showAIResponse('❌ Error en el reconocimiento de voz. Inténtalo de nuevo o usa el botón "Escribir".');
        stopRecording();
      };

      recognition.onend = () => {
        stopRecording();
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      showAIResponse('❌ Error al iniciar el reconocimiento de voz.');
      stopRecording();
    }
  }

  function stopRecording() {
    isRecording = false;
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    if (aiSpeakBtn) {
      aiSpeakBtn.innerHTML = '🎙️ Hablar';
      aiSpeakBtn.disabled = false;
    }
    aiStatus?.classList.add('hidden');
  }

  function processAIQuery(query) {
    hideAllStates();

    // Mostrar respuesta simulada de Sandra
    const responses = {
      'puerto': 'Perfecto! Para la zona del puerto tengo varias opciones. Te recomiendo el **Méndez Núñez 47** que está a solo 3 minutos andando del puerto y tiene llegada autónoma.',
      'centro': 'Excelente elección! Para el centro histórico te sugiero los apartamentos cerca de la **Plaza de la Virgen**. Todos con llegada autónoma y Wi-Fi incluido.',
      'playa': 'Para estar cerca de la playa, los apartamentos de **Malvarrosa** son ideales. A 10 minutos en metro del centro y con vistas al mar.',
      'familia': 'Para familias recomiendo apartamentos con 2-3 habitaciones. Tengo opciones con cocina completa y zona de juegos cercana.',
      'pareja': 'Para parejas, los estudios del centro son perfectos. Románticos, céntricos y con todas las comodidades.',
      'default': 'Gracias por tu consulta! Basándome en lo que me dices, te voy a conectar con nuestro sistema de reservas. También puedes llamarnos directamente al +34 624 829 117 para asesoramiento personalizado.'
    };

    let response = responses.default;
    const lowerQuery = query.toLowerCase();

    for (const [key, value] of Object.entries(responses)) {
      if (key !== 'default' && lowerQuery.includes(key)) {
        response = value;
        break;
      }
    }

    // Simular delay de procesamiento
    setTimeout(() => {
      showAIResponse(response);

      // Opcional: Abrir WhatsApp después de la respuesta
      setTimeout(() => {
        const waMsg = `Hola Sandra! ${query}`;
        const shouldOpenWA = confirm('¿Quieres continuar la conversación por WhatsApp para más detalles?');
        if (shouldOpenWA) {
          window.open(waLink(waMsg), '_blank');
        }
      }, 3000);
    }, 1500);
  }

  function showAIResponse(text) {
    hideAllStates();
    if (aiResponse && aiResponseText) {
      aiResponseText.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      aiResponse.classList.remove('hidden');

      // Scroll al response
      aiResponse.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // CTA: Buscar con Sandra (abre WhatsApp con filtros) - mantenemos compatibilidad
  const sandraBtn = document.getElementById('search-sandra');
  if (sandraBtn && form){
    sandraBtn.addEventListener('click', ()=>{
      const fd = new FormData(form);
      const q = Object.fromEntries(fd.entries());
      const msg = `Hola Sandra, ayúdame a buscar:\nZona: ${q.q||''}\nHuéspedes: ${q.guests||2}\nHabitaciones: ${q.rooms||1}\nNoches: ${q.nights||1}`;
      window.open(waLink(msg),'_blank');
    });
  }
})();