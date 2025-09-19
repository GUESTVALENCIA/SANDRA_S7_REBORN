// assets/sandra-widget-hybrid.js - Widget Híbrido Chat + Mini-Avatar
(() => {
  // CSS para el widget híbrido
  const hybridCss = `
  /* FAB Button */
  #sandra-fab-hybrid{
    position:fixed;
    right:16px;
    bottom:80px;
    width:66px;
    height:66px;
    border-radius:50%;
    background:#19C37D;
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:26px;
    cursor:pointer;
    box-shadow:0 10px 25px rgba(0,0,0,.2);
    z-index:50;
    transition:all 0.3s ease;
  }
  #sandra-fab-hybrid:hover{
    transform:scale(1.1);
    box-shadow:0 15px 35px rgba(0,0,0,.3);
  }

  /* Widget Panel */
  #sandra-widget{
    position:fixed;
    right:16px;
    bottom:80px;
    width:380px;
    height:520px;
    background:#fff;
    border-radius:20px;
    box-shadow:0 25px 60px rgba(0,0,0,.25);
    z-index:50;
    overflow:hidden;
    display:none;
    flex-direction:column;
  }
  #sandra-widget.open{
    display:flex;
  }

  /* Header */
  #sandra-widget-header{
    background:linear-gradient(135deg, #19C37D 0%, #15B574 100%);
    color:#fff;
    padding:16px 20px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    box-shadow:0 2px 10px rgba(0,0,0,.1);
  }
  #sandra-widget-title{
    font-weight:600;
    font-size:18px;
    display:flex;
    align-items:center;
    gap:8px;
  }
  #sandra-close-widget{
    background:transparent;
    border:none;
    color:#fff;
    font-size:20px;
    cursor:pointer;
    border-radius:50%;
    width:32px;
    height:32px;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:background 0.2s;
  }
  #sandra-close-widget:hover{
    background:rgba(255,255,255,0.2);
  }

  /* Tabs */
  #sandra-tabs{
    display:flex;
    background:#f8fafc;
    border-bottom:1px solid #e2e8f0;
  }
  .sandra-tab{
    flex:1;
    padding:12px 16px;
    text-align:center;
    background:transparent;
    border:none;
    cursor:pointer;
    font-weight:500;
    color:#64748b;
    transition:all 0.2s;
    border-bottom:3px solid transparent;
  }
  .sandra-tab.active{
    color:#19C37D;
    border-bottom-color:#19C37D;
    background:#fff;
  }
  .sandra-tab:hover:not(.active){
    background:#f1f5f9;
    color:#475569;
  }

  /* Content Areas */
  .sandra-content{
    flex:1;
    display:none;
    flex-direction:column;
  }
  .sandra-content.active{
    display:flex;
  }

  /* Chat Content */
  #sandra-chat-content{
    padding:16px;
  }
  #sandra-msgs-hybrid{
    display:flex;
    flex-direction:column;
    gap:12px;
    max-height:320px;
    overflow-y:auto;
    margin-bottom:16px;
    padding-right:8px;
  }
  #sandra-msgs-hybrid::-webkit-scrollbar{
    width:4px;
  }
  #sandra-msgs-hybrid::-webkit-scrollbar-track{
    background:#f1f5f9;
    border-radius:4px;
  }
  #sandra-msgs-hybrid::-webkit-scrollbar-thumb{
    background:#cbd5e1;
    border-radius:4px;
  }
  .sandra-bubble-hybrid{
    padding:12px 16px;
    border-radius:18px;
    max-width:80%;
    font-size:14px;
    line-height:1.4;
  }
  .sandra-user-hybrid{
    align-self:flex-end;
    background:linear-gradient(135deg, #19C37D 0%, #15B574 100%);
    color:#fff;
  }
  .sandra-ai-hybrid{
    align-self:flex-start;
    background:#f1f5f9;
    color:#334155;
  }

  /* Chat Input */
  #sandra-chat-input-area{
    display:flex;
    gap:8px;
    align-items:center;
    padding:12px;
    background:#f8fafc;
    border-radius:12px;
  }
  #sandra-input-hybrid{
    flex:1;
    padding:12px 16px;
    border:1px solid #e2e8f0;
    border-radius:10px;
    font-size:14px;
    outline:none;
    transition:border-color 0.2s;
  }
  #sandra-input-hybrid:focus{
    border-color:#19C37D;
    box-shadow:0 0 0 3px rgba(25,195,125,0.1);
  }
  #sandra-send-hybrid{
    background:#19C37D;
    color:#fff;
    border:none;
    border-radius:10px;
    padding:12px 16px;
    cursor:pointer;
    font-weight:500;
    transition:background 0.2s;
  }
  #sandra-send-hybrid:hover{
    background:#15B574;
  }

  /* Avatar Content */
  #sandra-avatar-content{
    padding:16px;
    display:flex;
    flex-direction:column;
    gap:16px;
  }

  /* Mini Video */
  #sandra-mini-video-container{
    position:relative;
    border-radius:16px;
    overflow:hidden;
    background:#000;
    aspect-ratio:9/16;
    max-height:280px;
  }
  #sandra-avatar-video-hybrid{
    width:100%;
    height:100%;
    object-fit:cover;
    display:block;
  }

  /* Video Controls Overlay */
  #sandra-video-controls{
    position:absolute;
    bottom:0;
    left:0;
    right:0;
    background:linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
    padding:16px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    opacity:0;
    transition:opacity 0.3s;
  }
  #sandra-mini-video-container:hover #sandra-video-controls{
    opacity:1;
  }

  /* Control Buttons */
  .sandra-control-btn{
    background:rgba(255,255,255,0.2);
    border:none;
    color:#fff;
    border-radius:8px;
    padding:8px 12px;
    cursor:pointer;
    font-size:12px;
    font-weight:500;
    transition:background 0.2s;
    backdrop-filter:blur(10px);
  }
  .sandra-control-btn:hover{
    background:rgba(255,255,255,0.3);
  }
  .sandra-control-btn:disabled{
    opacity:0.5;
    cursor:not-allowed;
  }

  /* PTT Controls */
  #sandra-ptt-controls{
    display:flex;
    flex-direction:column;
    gap:12px;
    align-items:center;
  }
  #sandra-ptt-area{
    display:flex;
    gap:12px;
    align-items:center;
  }
  #sandra-ptt-btn{
    width:60px;
    height:60px;
    border-radius:50%;
    border:none;
    cursor:pointer;
    font-size:24px;
    transition:all 0.2s;
    display:flex;
    align-items:center;
    justify-content:center;
    position:relative;
  }
  #sandra-ptt-btn.idle{
    background:#e2e8f0;
    color:#64748b;
  }
  #sandra-ptt-btn.recording{
    background:#ef4444;
    color:#fff;
    animation:pulse 1.5s infinite;
  }
  #sandra-ptt-btn.processing{
    background:#f59e0b;
    color:#fff;
  }
  @keyframes pulse{
    0%{ transform:scale(1); }
    50%{ transform:scale(1.05); }
    100%{ transform:scale(1); }
  }

  #sandra-stop-btn{
    width:40px;
    height:40px;
    border-radius:50%;
    background:#64748b;
    border:none;
    color:#fff;
    cursor:pointer;
    font-size:16px;
    transition:background 0.2s;
    display:none;
  }
  #sandra-stop-btn:hover{
    background:#475569;
  }
  #sandra-stop-btn.visible{
    display:flex;
    align-items:center;
    justify-content:center;
  }

  /* PTT Status */
  #sandra-ptt-status{
    font-size:13px;
    color:#64748b;
    text-align:center;
    min-height:20px;
  }

  /* Fullscreen Modal */
  #sandra-fullscreen-modal{
    position:fixed;
    top:0;
    left:0;
    width:100vw;
    height:100vh;
    background:rgba(0,0,0,0.95);
    z-index:9999;
    display:none;
    align-items:center;
    justify-content:center;
  }
  #sandra-fullscreen-modal.open{
    display:flex;
  }
  #sandra-fullscreen-video{
    max-width:90vw;
    max-height:90vh;
    border-radius:20px;
    box-shadow:0 25px 60px rgba(0,0,0,.5);
  }
  #sandra-fullscreen-close{
    position:absolute;
    top:20px;
    right:20px;
    background:rgba(255,255,255,0.2);
    border:none;
    color:#fff;
    font-size:24px;
    width:50px;
    height:50px;
    border-radius:50%;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    backdrop-filter:blur(10px);
    transition:background 0.2s;
  }
  #sandra-fullscreen-close:hover{
    background:rgba(255,255,255,0.3);
  }

  /* Responsive */
  @media (max-width: 480px) {
    #sandra-widget {
      right:8px;
      bottom:80px;
      width:calc(100vw - 16px);
      height:480px;
    }
    #sandra-fab-hybrid {
      right:12px;
    }
  }
  `;

  // Inyectar CSS
  const style = document.createElement("style");
  style.textContent = hybridCss;
  document.head.appendChild(style);

  // Crear FAB
  const fab = document.createElement("div");
  fab.id = "sandra-fab-hybrid";
  fab.title = "Abrir Sandra IA";
  fab.innerHTML = "🤖";
  document.body.appendChild(fab);

  // Crear Widget Principal
  const widget = document.createElement("div");
  widget.id = "sandra-widget";
  widget.innerHTML = `
    <!-- Header -->
    <div id="sandra-widget-header">
      <div id="sandra-widget-title">
        <span>🎭</span>
        <span>Sandra IA</span>
      </div>
      <button id="sandra-close-widget">✕</button>
    </div>

    <!-- Tabs -->
    <div id="sandra-tabs">
      <button class="sandra-tab active" data-tab="chat">💬 Chat</button>
      <button class="sandra-tab" data-tab="avatar">🎥 Avatar</button>
    </div>

    <!-- Chat Content -->
    <div id="sandra-chat-content" class="sandra-content active">
      <div id="sandra-msgs-hybrid">
        <div class="sandra-bubble-hybrid sandra-ai-hybrid">
          ¡Hola! Soy Sandra, tu asistente de Guests Valencia. ¿En qué puedo ayudarte?
        </div>
      </div>
      <div id="sandra-chat-input-area">
        <input id="sandra-input-hybrid" placeholder="Escribe tu mensaje..." />
        <button id="sandra-send-hybrid">Enviar</button>
      </div>
    </div>

    <!-- Avatar Content -->
    <div id="sandra-avatar-content" class="sandra-content">
      <!-- Mini Video -->
      <div id="sandra-mini-video-container">
        <video
          id="sandra-avatar-video-hybrid"
          autoplay
          playsinline
          muted
        ></video>

        <!-- Video Controls Overlay -->
        <div id="sandra-video-controls">
          <button class="sandra-control-btn" id="sandra-fullscreen-btn">⛶ Pantalla completa</button>
          <button class="sandra-control-btn" id="sandra-share-btn" disabled title="Función Premium">
            📤 Compartir
          </button>
        </div>
      </div>

      <!-- PTT Controls -->
      <div id="sandra-ptt-controls">
        <div id="sandra-ptt-area">
          <button id="sandra-ptt-btn" class="idle" title="Mantén presionado para hablar">
            🎤
          </button>
          <button id="sandra-stop-btn" title="Detener">
            ⏹️
          </button>
        </div>
        <div id="sandra-ptt-status">Toca y mantén presionado para hablar</div>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // Crear Modal Fullscreen
  const fullscreenModal = document.createElement("div");
  fullscreenModal.id = "sandra-fullscreen-modal";
  fullscreenModal.innerHTML = `
    <video id="sandra-fullscreen-video" controls></video>
    <button id="sandra-fullscreen-close">✕</button>
  `;
  document.body.appendChild(fullscreenModal);

  // Referencias DOM
  const msgsContainer = widget.querySelector("#sandra-msgs-hybrid");
  const chatInput = widget.querySelector("#sandra-input-hybrid");
  const sendBtn = widget.querySelector("#sandra-send-hybrid");
  const closeBtn = widget.querySelector("#sandra-close-widget");
  const tabs = widget.querySelectorAll(".sandra-tab");
  const contents = widget.querySelectorAll(".sandra-content");
  const avatarVideo = widget.querySelector("#sandra-avatar-video-hybrid");
  const pttBtn = widget.querySelector("#sandra-ptt-btn");
  const stopBtn = widget.querySelector("#sandra-stop-btn");
  const pttStatus = widget.querySelector("#sandra-ptt-status");
  const fullscreenBtn = widget.querySelector("#sandra-fullscreen-btn");
  const shareBtn = widget.querySelector("#sandra-share-btn");
  const fullscreenVideo = fullscreenModal.querySelector("#sandra-fullscreen-video");
  const fullscreenCloseBtn = fullscreenModal.querySelector("#sandra-fullscreen-close");

  // Estado del widget
  let currentTab = "chat";
  let isRecording = false;
  let mediaRecorder = null;
  let audioChunks = [];
  let ttsEnabled = true;
  let heygenEnabled = false;

  // Funciones de utilidad
  function addMessage(text, isUser = false) {
    const bubble = document.createElement("div");
    bubble.className = `sandra-bubble-hybrid ${isUser ? 'sandra-user-hybrid' : 'sandra-ai-hybrid'}`;
    bubble.textContent = text;
    msgsContainer.appendChild(bubble);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
  }

  function switchTab(tabName) {
    currentTab = tabName;

    // Actualizar tabs
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });

    // Actualizar contenidos
    contents.forEach(content => {
      content.classList.toggle("active", content.id.includes(tabName));
    });
  }

  function setPTTState(state) {
    pttBtn.className = state;

    switch(state) {
      case 'idle':
        pttStatus.textContent = "Toca y mantén presionado para hablar";
        stopBtn.classList.remove("visible");
        break;
      case 'recording':
        pttStatus.textContent = "🔴 Grabando... Suelta para enviar";
        stopBtn.classList.add("visible");
        break;
      case 'processing':
        pttStatus.textContent = "🟡 Procesando audio...";
        stopBtn.classList.remove("visible");
        break;
    }
  }

  // Funciones de audio y TTS
  async function playTTS(text) {
    if (!ttsEnabled) return;

    try {
      const response = await fetch("/.netlify/functions/sandra-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) return;

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {});
    } catch (error) {
      console.warn("TTS error:", error);
    }
  }

  async function sendChatMessage(message) {
    addMessage(message, true);
    chatInput.value = "";

    try {
      const response = await fetch("/.netlify/functions/sandra-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      const reply = data.reply || "Lo siento, no puedo responder en este momento.";

      addMessage(reply, false);
      await playTTS(reply);
      await updateAvatarVideo(reply);

    } catch (error) {
      addMessage("Error de conexión. Por favor, intenta de nuevo.", false);
    }
  }

  async function updateAvatarVideo(text) {
    if (!heygenEnabled) return;

    try {
      // Iniciar generación de video
      const startResponse = await fetch("/.netlify/functions/heygen-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const startData = await startResponse.json();
      if (!startResponse.ok || !startData.video_id) return;

      const videoId = startData.video_id;

      // Polling para obtener el video
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const statusResponse = await fetch(`/.netlify/functions/heygen-status?id=${videoId}`);
        const statusData = await statusResponse.json();

        if (statusData.video_url) {
          avatarVideo.src = statusData.video_url;
          avatarVideo.muted = false;
          avatarVideo.autoplay = true;
          avatarVideo.play().catch(() => {});
          break;
        }

        attempts++;
      }
    } catch (error) {
      console.warn("HeyGen error:", error);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processAudio(audioBlob);

        // Detener stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      isRecording = true;
      setPTTState('recording');

    } catch (error) {
      console.error("Error accessing microphone:", error);
      pttStatus.textContent = "Error: No se puede acceder al micrófono";
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      setPTTState('processing');
    }
  }

  async function processAudio(audioBlob) {
    try {
      // Aquí se enviaría el audio al endpoint de speech-to-text
      // Por ahora, simulamos la transcripción
      setPTTState('processing');

      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Transcripción simulada
      const transcription = "¿Tienes disponibilidad para este fin de semana?";

      addMessage(transcription, true);

      // Enviar a Sandra
      const response = await fetch("/.netlify/functions/sandra-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcription })
      });

      const data = await response.json();
      const reply = data.reply || "Lo siento, no puedo responder en este momento.";

      addMessage(reply, false);
      await playTTS(reply);
      await updateAvatarVideo(reply);

    } catch (error) {
      pttStatus.textContent = "Error procesando audio";
    } finally {
      setPTTState('idle');
    }
  }

  // Event Listeners

  // FAB toggle
  fab.addEventListener("click", () => {
    widget.classList.toggle("open");
  });

  // Cerrar widget
  closeBtn.addEventListener("click", () => {
    widget.classList.remove("open");
  });

  // Tabs
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Chat
  sendBtn.addEventListener("click", () => {
    const message = chatInput.value.trim();
    if (message) {
      sendChatMessage(message);
    }
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const message = chatInput.value.trim();
      if (message) {
        sendChatMessage(message);
      }
    }
  });

  // PTT Controls
  pttBtn.addEventListener("mousedown", startRecording);
  pttBtn.addEventListener("mouseup", stopRecording);
  pttBtn.addEventListener("mouseleave", stopRecording);

  // Touch events para móvil
  pttBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startRecording();
  });

  pttBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopRecording();
  });

  stopBtn.addEventListener("click", stopRecording);

  // Fullscreen
  fullscreenBtn.addEventListener("click", () => {
    if (avatarVideo.src) {
      fullscreenVideo.src = avatarVideo.src;
      fullscreenModal.classList.add("open");
    }
  });

  fullscreenCloseBtn.addEventListener("click", () => {
    fullscreenModal.classList.remove("open");
    fullscreenVideo.src = "";
  });

  // Cerrar fullscreen con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && fullscreenModal.classList.contains("open")) {
      fullscreenModal.classList.remove("open");
      fullscreenVideo.src = "";
    }
  });

  // Cerrar widget con clic fuera
  document.addEventListener("click", (e) => {
    if (!widget.contains(e.target) && !fab.contains(e.target) && widget.classList.contains("open")) {
      widget.classList.remove("open");
    }
  });

  // Verificar capacidades HeyGen al cargar
  async function checkHeyGenCapability() {
    try {
      const response = await fetch("/.netlify/functions/heygen-ready");
      const data = await response.json();
      heygenEnabled = !!data.enabled;
    } catch {
      heygenEnabled = false;
    }
  }

  // Inicializar
  checkHeyGenCapability();

  console.log("Sandra Widget Híbrido iniciado exitosamente");
})();