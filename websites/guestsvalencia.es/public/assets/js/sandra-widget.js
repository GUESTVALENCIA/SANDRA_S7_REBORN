/* Sandra Widget (WS + barge-in + audio streaming)
   Requiere: window.WSS_URL (wss://...) definido en index.html
   Servidor envía JSON por mensaje:
     {type:"token", content:"..."}            // texto incremental (opcional)
     {type:"audio_chunk", data:"<base64>"}    // audio PCM/Opus (elige uno)
     {type:"complete"}                        // fin de turno
     {type:"ready"}                           // listo para hablar
   Y recibe:
     {type:"start"}                           // iniciar sesión
     {type:"user_speech_begin"}               // PTT down
     {type:"user_speech_end"}                 // PTT up (enviar ASR)
     {type:"cancel"}                          // barge-in: cortar TTS servidor
     {type:"user_text", content:"..."}        // (opcional) enviar texto
*/

(function(){
  const $ = (s,p=document)=>p.querySelector(s);
  const logEl = $('#sandra-log'), panel=$('#sandra-panel');
  const btnToggle=$('#sandra-toggle'), btnClose=$('#sandra-close');
  const btnPTT=$('#sandra-ptt'), btnStop=$('#sandra-stop');

  // Híbrido: Chat + Video + Avatar + Pantalla Compartida
  const textInput = $('#sandra-text-input');
  const videoToggle = $('#sandra-video-toggle');
  const fullscreenBtn = $('#sandra-fullscreen');
  const shareBtn = $('#sandra-share');
  const videoArea = $('#sandra-video-area');
  const chatArea = $('#sandra-chat-area');
  const fullscreenModal = $('#sandra-fullscreen-modal');
  const videoSizeSelect = $('#sandra-video-size');

  let videoMode = false; // false = chat, true = video
  let screenShare = null;

  let ws=null, open=false, playing=false, mediaSource, audioCtx, sourceNode, queue=[];
  let micStream, mediaRec, chunks=[];

  function log(m){
    if(!logEl) return;
    const d=document.createElement('div');
    d.textContent=m;
    logEl.appendChild(d);
    logEl.scrollTop=logEl.scrollHeight;

    // También mostrar en chat si está en modo chat
    if (!videoMode && chatArea) {
      const chatMsg = document.createElement('div');
      chatMsg.className = 'text-xs text-blue-400 mb-1';
      chatMsg.textContent = m;
      chatArea.appendChild(chatMsg);
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }

  function connect(){
    if(open) return;
    ws = new WebSocket(window.WSS_URL);
    ws.binaryType = "arraybuffer";
    ws.onopen = ()=>{ open=true; ws.send(JSON.stringify({type:'start'})); log('Conectado 🟢'); };
    ws.onclose= ()=>{ open=false; log('Desconectado 🔴'); };
    ws.onerror= (e)=>{ log('WS error'); console.error(e); };
    ws.onmessage = (ev)=>{
      // texto o audio
      try{
        // si es binario, lo tratamos como audio directo
        if(ev.data instanceof ArrayBuffer){
          enqueueAudio(new Uint8Array(ev.data));
          return;
        }
        const msg = JSON.parse(ev.data);
        if(msg.type === 'token'){
          log('Sandra: '+msg.content);
          // Mostrar en chat si está en modo chat
          if (!videoMode && chatArea) {
            const chatMsg = document.createElement('div');
            chatMsg.className = 'text-white mb-2 p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-4';
            chatMsg.textContent = msg.content;
            chatArea.appendChild(chatMsg);
            chatArea.scrollTop = chatArea.scrollHeight;
          }
        }
        if(msg.type === 'audio_chunk'){
          // base64 → bytes
          const bstr = atob(msg.data); const bytes = new Uint8Array(bstr.length);
          for(let i=0;i<bstr.length;i++) bytes[i]=bstr.charCodeAt(i);
          enqueueAudio(bytes);
        }
        if(msg.type === 'complete'){ log('✓ Fin de turno'); }
        if(msg.type === 'ready'){ log('Listo para hablar'); }
      }catch(_){ /* ignore */ }
    };
  }

  async function ensureAudio(){
    if(audioCtx) return;
    audioCtx = new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});
    sourceNode = audioCtx.createBufferSource(); // usaremos decodeAudioData por chunk
  }

  // Cola y reproducción simple (PCM/Opus decodificado por decodeAudioData)
  async function enqueueAudio(bytes){
    await ensureAudio();
    playing = true;
    try{
      const buf = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
      const node = audioCtx.createBufferSource(); node.buffer = buf; node.connect(audioCtx.destination); node.start();
      node.onended = ()=>{ /* podríamos encadenar */ };
    }catch(e){ console.warn('Audio decode error', e); }
  }

  async function pttStart(){
    // barge-in: pide al servidor cortar su TTS YA
    if(open) ws.send(JSON.stringify({type:'cancel'}));
    // capturar micro
    micStream = await navigator.mediaDevices.getUserMedia({audio:true});
    mediaRec = new MediaRecorder(micStream, {mimeType: 'audio/webm;codecs=opus'});
    chunks.length=0;
    mediaRec.ondataavailable = e=>{ if(e.data && e.data.size>0) chunks.push(e.data); };
    mediaRec.onstop = async ()=>{
      const blob = new Blob(chunks, {type:'audio/webm;codecs=opus'});
      const arr = new Uint8Array(await blob.arrayBuffer());
      // enviamos el audio del usuario al servidor ASR
      if(open) ws.send(arr.buffer);
      chunks.length=0;
    };
    mediaRec.start(100);
    if(open) ws.send(JSON.stringify({type:'user_speech_begin'}));
    log('🎙️ Grabando… (PTT)');
  }

  function pttStop(){
    if(mediaRec && mediaRec.state!=='inactive'){ mediaRec.stop(); }
    if(micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream=null; }
    if(open) ws.send(JSON.stringify({type:'user_speech_end'}));
    log('⏹️ Fin usuario');
  }

  function stopAll(){
    // parar audio de salida
    if(audioCtx){ try{ audioCtx.suspend(); }catch(_){} }
    // avisar a servidor
    if(open) ws.send(JSON.stringify({type:'cancel'}));
    log('⛔ Parar todo');
  }

  // Híbrido: Enviar mensaje de texto
  function sendTextMessage() {
    const text = textInput?.value?.trim();
    if (!text || !open) return;

    // Mostrar mensaje del usuario en chat
    if (chatArea) {
      const userMsg = document.createElement('div');
      userMsg.className = 'text-white mb-2 p-2 bg-gray-700 rounded-lg ml-4 text-right';
      userMsg.textContent = text;
      chatArea.appendChild(userMsg);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Enviar al servidor
    ws.send(JSON.stringify({type:'user_text', content: text}));
    textInput.value = '';
    log('Tú: ' + text);
  }

  // Cambiar entre modo chat y video
  function toggleVideoMode() {
    videoMode = !videoMode;

    if (videoMode) {
      // Modo video: ocultar chat, mostrar video
      chatArea?.classList.add('hidden');
      videoArea?.classList.remove('hidden');
      videoToggle.textContent = '💬';
      videoToggle.title = 'Cambiar a chat';

      // Inicializar video/avatar si no está activo
      if (!sandraAvatar) {
        initAvatar();
      }
    } else {
      // Modo chat: mostrar chat, ocultar video
      chatArea?.classList.remove('hidden');
      videoArea?.classList.add('hidden');
      videoToggle.textContent = '📹';
      videoToggle.title = 'Cambiar a video';
    }
  }

  // Pantalla completa
  function toggleFullscreen() {
    const modal = fullscreenModal;
    if (!modal) return;

    if (modal.classList.contains('hidden')) {
      modal.classList.remove('hidden');
      // Clonar contenido de video al modal
      const videoClone = videoArea?.cloneNode(true);
      if (videoClone) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent?.appendChild(videoClone);
      }
    } else {
      modal.classList.add('hidden');
      // Limpiar contenido del modal
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) modalContent.innerHTML = '';
    }
  }

  // Compartir pantalla
  async function toggleScreenShare() {
    try {
      if (!screenShare) {
        // Iniciar compartir pantalla
        screenShare = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        // Mostrar en video area si está disponible
        if (videoArea) {
          const video = document.createElement('video');
          video.srcObject = screenShare;
          video.autoplay = true;
          video.className = 'w-full h-full object-cover rounded-lg';
          videoArea.appendChild(video);
        }

        shareBtn.textContent = '⏹️';
        shareBtn.title = 'Parar compartir';
        log('📤 Compartiendo pantalla');

        // Detectar cuando se pare desde el navegador
        screenShare.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

      } else {
        stopScreenShare();
      }
    } catch (e) {
      log('❌ Error compartir pantalla: ' + e.message);
    }
  }

  function stopScreenShare() {
    if (screenShare) {
      screenShare.getTracks().forEach(track => track.stop());
      screenShare = null;
    }
    shareBtn.textContent = '📤';
    shareBtn.title = 'Compartir pantalla';

    // Limpiar video area
    const videos = videoArea?.querySelectorAll('video');
    videos?.forEach(v => v.remove());

    log('⏹️ Compartir pantalla detenido');
  }

  // Cambiar tamaño de video
  function changeVideoSize() {
    const size = videoSizeSelect?.value || 'medium';
    const container = $('#sandra-avatar-container');
    if (!container) return;

    container.classList.remove('w-32', 'h-24', 'w-48', 'h-36', 'w-64', 'h-48');

    switch(size) {
      case 'mini':
        container.classList.add('w-32', 'h-24');
        break;
      case 'medium':
        container.classList.add('w-48', 'h-36');
        break;
      case 'large':
        container.classList.add('w-64', 'h-48');
        break;
    }
  }

  // Avatar integration
  const avatarContainer = $('#sandra-avatar-container');
  const avatarToggle = $('#sandra-avatar-toggle');
  let sandraAvatar = null;

  async function initAvatar() {
    if (sandraAvatar) return;
    try {
      // Load HeyGen integration (when available)
      if (window.integrateSandraAvatar) {
        sandraAvatar = window.integrateSandraAvatar('#sandra-avatar-container', {
          apiKey: window.HEYGEN_API_KEY || 'demo',
          avatarId: window.HEYGEN_AVATAR_ID || 'sandra_v1'
        });
        log('🎭 Avatar conectado nivel Premium');
      } else {
        log('⚠️ Avatar Premium no disponible');
      }
    } catch (e) {
      log('Avatar error: ' + e.message);
    }
  }

  // UI Eventos
  btnToggle?.addEventListener('click', ()=>{
    panel.classList.toggle('hidden');
    if(!open) connect();
  });

  btnClose?.addEventListener('click', ()=> {
    panel.classList.add('hidden');
    stopScreenShare(); // Limpiar compartir pantalla al cerrar
  });

  // Híbrido: Nuevos controles
  videoToggle?.addEventListener('click', toggleVideoMode);
  fullscreenBtn?.addEventListener('click', toggleFullscreen);
  shareBtn?.addEventListener('click', toggleScreenShare);
  videoSizeSelect?.addEventListener('change', changeVideoSize);

  // Chat de texto
  textInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendTextMessage();
    }
  });

  // Modal fullscreen - cerrar con X
  const modalClose = $('#sandra-modal-close');
  modalClose?.addEventListener('click', () => {
    fullscreenModal?.classList.add('hidden');
  });

  // Avatar toggle
  avatarToggle?.addEventListener('click', ()=> {
    avatarContainer?.classList.toggle('hidden');
    if (!avatarContainer?.classList.contains('hidden')) {
      initAvatar();
    }
  });

  // PTT (Push to Talk)
  btnPTT?.addEventListener('mousedown', pttStart);
  btnPTT?.addEventListener('touchstart', (e)=>{e.preventDefault(); pttStart();},{passive:false});
  btnPTT?.addEventListener('mouseup', pttStop);
  btnPTT?.addEventListener('mouseleave', ()=>{ if(mediaRec && mediaRec.state==='recording') pttStop(); });
  btnPTT?.addEventListener('touchend', pttStop);
  btnStop?.addEventListener('click', stopAll);

  // Store WebSocket reference for HeyGen integration
  window.sandra_ws = ws;

})();