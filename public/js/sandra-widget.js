// Sandra Widget - Vanilla JS Flotante Limpio
// Compatible con cualquier web - Sin dependencias
(function() {
  'use strict';

  // Configuración desde data-attributes
  const script = document.currentScript;
  const CONFIG = {
    endpoint: script.dataset.endpoint || '/chat',
    brand: script.dataset.brand || '#007bff',
    accent: script.dataset.accent || '#f8f9fa',
    avatar: script.dataset.avatar || null,
    apiKey: script.dataset.apiKey || 'gv_sandra_7_prod_2024_auth_token_valencia_premium'
  };

  // Estado global del widget
  const state = {
    isOpen: false,
    isRecording: false,
    messages: [],
    isTyping: false,
    isOnline: navigator.onLine,
    // === CONVERSATIONAL MODE CIO ===
    isConversationalMode: false,
    audioContext: null,
    micStream: null,
    vadWorkletNode: null,
    tts: { playing: false, audio: null }
  };

  // Utilidades
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);
  
  function uuid() {
    return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function timeFormat(date) {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // API Helper
  async function callAPI(message) {
    const startTime = Date.now();
    try {
      const response = await fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.apiKey}`
        },
        body: JSON.stringify({
          message: message,
          language: 'es'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        data: data,
        responseTime: responseTime,
        message: data.message || data.reply || JSON.stringify(data)
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        responseTime: responseTime,
        message: `Error: ${error.message}`
      };
    }
  }

  // Speech to Text (usando Web Speech API como fallback)
  function startSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Reconocimiento de voz no disponible', 'error');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      state.isRecording = true;
      updateMicButton();
      showToast('Escuchando...', 'info');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      if (event.results[0].isFinal) {
        addMessage('user', transcript);
        sendMessage(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      showToast('Error en reconocimiento de voz', 'error');
      state.isRecording = false;
      updateMicButton();
    };

    recognition.onend = () => {
      state.isRecording = false;
      updateMicButton();
    };

    recognition.start();
    return recognition;
  }

  // Text to Speech
  function speak(text) {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // INTEGRACIÓN CON SISTEMA CONVERSACIONAL CIO
    state.tts.audio = utterance;
    state.tts.playing = true;
    
    utterance.onend = () => {
      state.tts.playing = false;
      state.tts.audio = null;
    };
    
    utterance.onstart = () => {
      state.tts.playing = true;
    };
    
    window.speechSynthesis.speak(utterance);
  }

  // Mensajes
  function addMessage(role, text, options = {}) {
    const message = {
      id: uuid(),
      role: role,
      text: text,
      timestamp: new Date(),
      ...options
    };
    
    state.messages.push(message);
    renderMessages();
    scrollToBottom();
    
    return message;
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    
    state.isTyping = true;
    updateTypingIndicator();
    
    const result = await callAPI(text);
    
    state.isTyping = false;
    updateTypingIndicator();
    
    if (result.success) {
      const assistantMsg = addMessage('assistant', result.message, {
        responseTime: result.responseTime
      });
      
      // TTS para respuestas cortas
      if (result.message.length < 200) {
        speak(result.message);
      }
      
      showToast(`Respuesta en ${result.responseTime}ms`, 'success');
    } else {
      addMessage('system', `Error: ${result.error}`, {
        responseTime: result.responseTime
      });
      showToast(`Error: ${result.error}`, 'error');
    }
  }

  // UI Rendering
  function renderMessages() {
    const container = $('.sandra-messages');
    if (!container) return;
    
    container.innerHTML = state.messages.map(msg => `
      <div class="sandra-message sandra-message-${msg.role}">
        <div class="sandra-message-content">${msg.text}</div>
        <div class="sandra-message-meta">
          ${timeFormat(msg.timestamp)}
          ${msg.responseTime ? ` • ${msg.responseTime}ms` : ''}
        </div>
      </div>
    `).join('');
  }

  function updateMicButton() {
    const micBtn = $('.sandra-mic-btn');
    if (micBtn) {
      micBtn.classList.toggle('sandra-recording', state.isRecording);
      micBtn.innerHTML = state.isRecording ? '⏹️' : '🎤';
    }
  }

  function updateTypingIndicator() {
    const indicator = $('.sandra-typing');
    if (indicator) {
      indicator.style.display = state.isTyping ? 'block' : 'none';
    }
  }

  function scrollToBottom() {
    const container = $('.sandra-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Toast notifications
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `sandra-toast sandra-toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('sandra-toast-show'), 10);
    
    // Remove after 3s
    setTimeout(() => {
      toast.classList.remove('sandra-toast-show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  // === SISTEMA CONVERSACIONAL CIO ===
  async function toggleConversationalMode() {
    const conversationalBtn = $('#sandra-conversational-btn');
    
    if (!state.isConversationalMode) {
      try {
        // Solicitar micrófono una sola vez para reutilizar stream
        if (!state.micStream) {
          state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        
        // Crear contexto de audio
        if (!state.audioContext) {
          state.audioContext = new AudioContext();
          await state.audioContext.audioWorklet.addModule('vad-processor.js');
        }
        
        // Crear fuente de micrófono reutilizando stream existente
        const micSource = state.audioContext.createMediaStreamSource(state.micStream);
        
        // Crear worklet VAD con parámetros del CIO
        state.vadWorkletNode = new AudioWorkletNode(state.audioContext, 'vad-processor', {
          processorOptions: {
            threshold: 0.012,
            attackMs: 120,
            releaseMs: 250
          }
        });
        
        // CONFIGURAR MANEJO DE BARGE-IN SEGÚN CIO
        state.vadWorkletNode.port.onmessage = (event) => {
          const { type, speaking } = event.data;
          
          if (type === 'speech') {
            if (speaking && state.tts.playing) {
              // BARGE-IN: Usuario habla mientras Sandra habla
              if (state.tts.audio) {
                state.tts.audio.pause();
                state.tts.playing = false;
              }
              showToast('🔄 Interrumpido - Te escucho', 'info');
              
              if (!state.isRecording) {
                const recognition = startSpeechRecognition();
              }
            } else if (speaking && !state.tts.playing) {
              // Usuario habla normalmente
              showToast('🎤 Te escucho...', 'info');
              
              if (!state.isRecording) {
                const recognition = startSpeechRecognition();
              }
            }
          }
        };
        
        // Conectar audio pipeline según especificaciones CIO
        micSource.connect(state.vadWorkletNode);
        state.vadWorkletNode.connect(state.audioContext.destination);
        
        state.isConversationalMode = true;
        conversationalBtn.innerHTML = '🔴';
        conversationalBtn.classList.add('sandra-active');
        showToast('💬 MODO CONVERSACIONAL ACTIVADO', 'success');
        
      } catch (error) {
        console.error('Error activando modo conversacional:', error);
        showToast('❌ Error activando modo conversacional', 'error');
      }
      
    } else {
      // DESACTIVAR modo conversacional
      if (state.vadWorkletNode) {
        state.vadWorkletNode.disconnect();
        state.vadWorkletNode = null;
      }
      
      state.isConversationalMode = false;
      conversationalBtn.innerHTML = '💬';
      conversationalBtn.classList.remove('sandra-active');
      showToast('💬 Modo conversacional desactivado', 'info');
    }
  }

  // Widget HTML
  function createWidget() {
    const widgetHTML = `
      <!-- Sandra Widget Flotante -->
      <div class="sandra-widget" id="sandra-widget">
        <!-- Botón flotante -->
        <div class="sandra-fab" id="sandra-fab">
          <div class="sandra-fab-icon">💬</div>
          <div class="sandra-fab-label">Sandra IA</div>
        </div>

        <!-- Panel principal -->
        <div class="sandra-panel" id="sandra-panel">
          <div class="sandra-header">
            <div class="sandra-title">
              <div class="sandra-avatar">🤖</div>
              <div>
                <div class="sandra-name">Sandra IA</div>
                <div class="sandra-status">
                  <div class="sandra-status-dot ${state.isOnline ? 'online' : 'offline'}"></div>
                  ${state.isOnline ? 'En línea' : 'Sin conexión'}
                </div>
              </div>
            </div>
            <button class="sandra-close" id="sandra-close">✕</button>
          </div>

          <div class="sandra-tabs">
            <button class="sandra-tab sandra-tab-active" data-tab="chat">Chat</button>
            <button class="sandra-tab" data-tab="voice">Voz</button>
            ${CONFIG.avatar ? '<button class="sandra-tab" data-tab="avatar">Avatar</button>' : ''}
          </div>

          <div class="sandra-content">
            <!-- Tab Chat -->
            <div class="sandra-tab-content sandra-tab-active" id="sandra-tab-chat">
              <div class="sandra-quick-actions">
                <button class="sandra-quick-btn" data-prompt="¿Qué alojamientos tienes disponibles?">
                  📅 Disponibilidad
                </button>
                <button class="sandra-quick-btn" data-prompt="¿Cómo llego desde la estación?">
                  📍 Cómo llegar
                </button>
                <button class="sandra-quick-btn" data-prompt="¿Puedes mejorar el precio?">
                  💰 Mejor precio
                </button>
                <button class="sandra-quick-btn" data-prompt="Can we switch to English?">
                  🌍 English
                </button>
              </div>

              <div class="sandra-messages-container">
                <div class="sandra-messages"></div>
                <div class="sandra-typing" style="display: none;">
                  <div class="sandra-typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                  Sandra está escribiendo...
                </div>
              </div>

              <div class="sandra-input-container">
                <textarea 
                  class="sandra-input" 
                  id="sandra-input" 
                  placeholder="Escribe tu mensaje..."
                  rows="1"
                ></textarea>
                <button class="sandra-send-btn" id="sandra-send-btn">
                  📤
                </button>
              </div>
            </div>

            <!-- Tab Voz -->
            <div class="sandra-tab-content" id="sandra-tab-voice">
              <div class="sandra-voice-container">
                <div class="sandra-voice-status">
                  <div class="sandra-voice-indicator"></div>
                  <p>Mantén presionado para hablar</p>
                </div>
                <div class="sandra-mic-buttons">
                  <button class="sandra-mic-btn" id="sandra-mic-btn">🎤</button>
                  <button class="sandra-conversational-btn" id="sandra-conversational-btn" title="Modo conversacional con barge-in">💬</button>
                </div>
                <div class="sandra-voice-tips">
                  <p>Consejos:</p>
                  <ul>
                    <li>Habla claro y despacio</li>
                    <li>Evita ruido de fondo</li>
                    <li>Usa frases completas</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Tab Avatar -->
            ${CONFIG.avatar ? `
            <div class="sandra-tab-content" id="sandra-tab-avatar">
              <div class="sandra-avatar-container">
                <video 
                  class="sandra-avatar-video" 
                  src="${CONFIG.avatar}" 
                  autoplay 
                  loop 
                  muted
                ></video>
                <div class="sandra-avatar-controls">
                  <button class="sandra-avatar-btn">👋 Saludar</button>
                  <button class="sandra-avatar-btn">❓ Ayuda</button>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Inyectar HTML
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }

  // Estilos CSS
  function injectStyles() {
    const styles = `
      <style>
        .sandra-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .sandra-fab {
          background: ${CONFIG.brand};
          color: white;
          border-radius: 50px;
          padding: 12px 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          user-select: none;
        }

        .sandra-fab:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        }

        .sandra-fab-icon {
          font-size: 20px;
        }

        .sandra-fab-label {
          font-weight: 600;
          font-size: 14px;
        }

        .sandra-panel {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }

        .sandra-panel.sandra-open {
          display: flex;
          animation: sandraSlideUp 0.3s ease-out;
        }

        @keyframes sandraSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sandra-header {
          padding: 16px;
          background: ${CONFIG.accent};
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sandra-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sandra-avatar {
          width: 40px;
          height: 40px;
          background: ${CONFIG.brand};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .sandra-name {
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }

        .sandra-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #666;
        }

        .sandra-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ccc;
        }

        .sandra-status-dot.online {
          background: #22c55e;
        }

        .sandra-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
          padding: 4px;
          border-radius: 4px;
        }

        .sandra-close:hover {
          background: rgba(0,0,0,0.1);
        }

        .sandra-tabs {
          display: flex;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .sandra-tab {
          flex: 1;
          padding: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          transition: all 0.2s ease;
        }

        .sandra-tab.sandra-tab-active {
          color: ${CONFIG.brand};
          background: white;
          border-bottom: 2px solid ${CONFIG.brand};
        }

        .sandra-content {
          flex: 1;
          overflow: hidden;
        }

        .sandra-tab-content {
          display: none;
          height: 100%;
          flex-direction: column;
        }

        .sandra-tab-content.sandra-tab-active {
          display: flex;
        }

        .sandra-quick-actions {
          padding: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .sandra-quick-btn {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .sandra-quick-btn:hover {
          background: ${CONFIG.brand};
          color: white;
          border-color: ${CONFIG.brand};
        }

        .sandra-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .sandra-messages {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sandra-message {
          max-width: 80%;
        }

        .sandra-message-user {
          align-self: flex-end;
        }

        .sandra-message-assistant,
        .sandra-message-system {
          align-self: flex-start;
        }

        .sandra-message-content {
          background: #f1f3f4;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.4;
        }

        .sandra-message-user .sandra-message-content {
          background: ${CONFIG.brand};
          color: white;
        }

        .sandra-message-system .sandra-message-content {
          background: #fef3c7;
          color: #92400e;
          font-style: italic;
        }

        .sandra-message-meta {
          font-size: 11px;
          color: #666;
          margin-top: 4px;
          text-align: right;
        }

        .sandra-message-user .sandra-message-meta {
          text-align: right;
        }

        .sandra-message-assistant .sandra-message-meta,
        .sandra-message-system .sandra-message-meta {
          text-align: left;
        }

        .sandra-typing {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 13px;
          font-style: italic;
        }

        .sandra-typing-dots {
          display: flex;
          gap: 2px;
        }

        .sandra-typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #666;
          animation: sandraDot 1.4s infinite ease-in-out both;
        }

        .sandra-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .sandra-typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes sandraDot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .sandra-input-container {
          padding: 16px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .sandra-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          resize: none;
          max-height: 80px;
          min-height: 20px;
          font-family: inherit;
        }

        .sandra-input:focus {
          outline: none;
          border-color: ${CONFIG.brand};
        }

        .sandra-send-btn {
          background: ${CONFIG.brand};
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .sandra-send-btn:hover {
          background: color-mix(in srgb, ${CONFIG.brand} 80%, black);
          transform: scale(1.05);
        }

        .sandra-send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .sandra-voice-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 32px;
          text-align: center;
        }

        .sandra-voice-status {
          margin-bottom: 24px;
        }

        .sandra-voice-indicator {
          width: 80px;
          height: 80px;
          border: 3px solid ${CONFIG.brand};
          border-radius: 50%;
          margin: 0 auto 12px;
          position: relative;
        }

        .sandra-voice-indicator::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: ${CONFIG.brand};
          border-radius: 50%;
        }

        .sandra-mic-buttons {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
        }

        .sandra-mic-btn, .sandra-conversational-btn {
          background: ${CONFIG.brand};
          color: white;
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          font-size: 32px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sandra-conversational-btn {
          background: #9333ea;
        }

        .sandra-mic-btn:hover, .sandra-conversational-btn:hover {
          background: color-mix(in srgb, ${CONFIG.brand} 80%, black);
          transform: scale(1.05);
        }

        .sandra-conversational-btn:hover {
          background: color-mix(in srgb, #9333ea 80%, black);
        }

        .sandra-mic-btn.sandra-recording {
          background: #ef4444;
          animation: sandraPulse 1s infinite;
        }

        .sandra-conversational-btn.sandra-active {
          background: #dc2626;
          animation: sandraPulse 1s infinite;
        }

        @keyframes sandraPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .sandra-voice-tips {
          color: #666;
          font-size: 13px;
          text-align: left;
        }

        .sandra-voice-tips ul {
          margin: 8px 0 0 0;
          padding-left: 16px;
        }

        .sandra-voice-tips li {
          margin-bottom: 4px;
        }

        .sandra-avatar-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 16px;
        }

        .sandra-avatar-video {
          flex: 1;
          width: 100%;
          border-radius: 12px;
          background: #000;
        }

        .sandra-avatar-controls {
          margin-top: 16px;
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .sandra-avatar-btn {
          background: ${CONFIG.brand};
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sandra-avatar-btn:hover {
          background: color-mix(in srgb, ${CONFIG.brand} 80%, black);
        }

        .sandra-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(-100%);
          background: #333;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          z-index: 10000;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .sandra-toast.sandra-toast-show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        .sandra-toast.sandra-toast-success {
          background: #22c55e;
        }

        .sandra-toast.sandra-toast-error {
          background: #ef4444;
        }

        .sandra-toast.sandra-toast-info {
          background: #3b82f6;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .sandra-panel {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            bottom: 60px;
            right: 20px;
            left: 20px;
          }
          
          .sandra-quick-actions {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Event Handlers
  function attachEventHandlers() {
    const fab = $('#sandra-fab');
    const panel = $('#sandra-panel');
    const closeBtn = $('#sandra-close');
    const sendBtn = $('#sandra-send-btn');
    const input = $('#sandra-input');
    const micBtn = $('#sandra-mic-btn');

    // Toggle panel
    fab.addEventListener('click', () => {
      state.isOpen = !state.isOpen;
      panel.classList.toggle('sandra-open', state.isOpen);
      
      if (state.isOpen && state.messages.length === 0) {
        addMessage('assistant', 'Hola, soy Sandra. ¿En qué te ayudo? Puedo gestionar tu reserva, resolver el check-in o darte recomendaciones.');
      }
    });

    closeBtn.addEventListener('click', () => {
      state.isOpen = false;
      panel.classList.remove('sandra-open');
    });

    // Tab switching
    $$('.sandra-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        $$('.sandra-tab').forEach(t => t.classList.remove('sandra-tab-active'));
        $$('.sandra-tab-content').forEach(c => c.classList.remove('sandra-tab-active'));
        
        tab.classList.add('sandra-tab-active');
        $(`#sandra-tab-${tabName}`).classList.add('sandra-tab-active');
      });
    });

    // Quick actions
    $$('.sandra-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        addMessage('user', prompt);
        sendMessage(prompt);
      });
    });

    // Send message
    function handleSend() {
      const text = input.value.trim();
      if (!text) return;
      
      addMessage('user', text);
      input.value = '';
      sendMessage(text);
      
      // Auto resize textarea
      input.style.height = 'auto';
    }

    sendBtn.addEventListener('click', handleSend);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Auto resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    });

    // Voice recording
    let recognition = null;
    
    micBtn.addEventListener('click', () => {
      if (state.isRecording) {
        if (recognition) {
          recognition.stop();
        }
      } else {
        recognition = startSpeechRecognition();
      }
    });

    // Conversational mode CIO
    const conversationalBtn = $('#sandra-conversational-btn');
    if (conversationalBtn) {
      conversationalBtn.addEventListener('click', toggleConversationalMode);
    }

    // Avatar controls
    $$('.sandra-avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.textContent.includes('Saludar') ? 'saludar' : 'ayuda';
        const message = action === 'saludar' ? 'Hola Sandra, ¿cómo estás?' : '¿En qué puedes ayudarme?';
        
        addMessage('user', message);
        sendMessage(message);
        
        // Switch to chat tab
        $('.sandra-tab[data-tab="chat"]').click();
      });
    });

    // Online/offline detection
    window.addEventListener('online', () => {
      state.isOnline = true;
      $('.sandra-status-dot').classList.add('online');
      $('.sandra-status').innerHTML = '<div class="sandra-status-dot online"></div>En línea';
      showToast('Conexión restaurada', 'success');
    });

    window.addEventListener('offline', () => {
      state.isOnline = false;
      $('.sandra-status-dot').classList.remove('online');
      $('.sandra-status').innerHTML = '<div class="sandra-status-dot"></div>Sin conexión';
      showToast('Sin conexión a internet', 'error');
    });
  }

  // Initialization
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    injectStyles();
    createWidget();
    attachEventHandlers();
    
    // Initial state
    renderMessages();
    
    console.log('✅ Sandra Widget loaded successfully');
    console.log('📊 Config:', CONFIG);
  }

  // Auto-initialize
  init();
})();