// Sandra IA · HRV Recovery Pack
(function(){
  const number = "+34600000000";
  const waLink = (num, text) => `https://wa.me/${num.replace(/\D/g,'')}${text ? ('?text=' + encodeURIComponent(text)) : ''}`;
  const $ = (s)=>document.querySelector(s);
  const logEl = $("#log");
  function log(t){ const el=document.createElement("div"); el.textContent=t; logEl.appendChild(el); logEl.scrollTop=logEl.scrollHeight; }

  // Fill dynamic bits
  const waHero = $("#waHero"); if(waHero) waHero.href = waLink(number, "Hola Sandra, quiero reservar");
  const waSide = $("#waSide"); if(waSide){ waSide.textContent = number; waSide.href = waLink(number); }
  $("#y").textContent = new Date().getFullYear();

  // Realtime/chat panel toggles
  const openChatBtn = $("#open-chat-btn");
  const closeChatBtn = $("#close-chat-btn");
  const rt = $("#realtime-container");
  openChatBtn.addEventListener('click', () => {
    rt.style.display = 'block';
    openChatBtn.style.display = 'none';
    loadAvatar("{{TU_HEYGEN_VIDEO_ID}}"); // pon el ID que usas
    connectAssistant();
  });
  closeChatBtn.addEventListener("click", ()=>{ rt.style.display="none"; openChatBtn.style.display="grid"; });

  // Mic + VU demo (client-side only)
  const $state=$("#state"), $lat=$("#latency"), $mic=$("#mic"), $txt=$("#txt");
  $txt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.getElementById("btnSend").click();
    }
  });
  let mediaStream, mediaRec, chunks=[], ctx, analyser, source, muted=false;
  const API_ORIGIN = ""; // same origin on Netlify

  function setState(t, ok){ $state.textContent=t; $state.className = "pill " + (ok?"ok":"bad"); }
  function vu(){ if(!analyser) return; const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data); let max=0; for(let i=0;i<data.length;i++){ const v=Math.abs(data[i]-128); if(v>max) max=v; }
    document.querySelector("#vu>div").style.width = Math.min(100,(max/128)*100) + "%"; requestAnimationFrame(v);
  }

  async function connectAssistant(){
    try{
      setState("Conectando…", true);
      // Optional: load avatar share if function exists
      fetch("/.netlify/functions/heygen-share",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({video_id:"demo"})})
        .then(r=>r.json()).then(d=>{
          const u=(d?.data?.url||d?.url||"").replace("/share/","/embeds/");
          if(u) $("#emb").src=u;
        }).catch(()=>{});
      setState("Conectado", true);
      speakLocal("Hola, soy Sandra. Estoy lista para ayudarte.");
    }catch(e){
      setState("Error", false);
      logger("Error conectando: "+e.message);
    }
  }

  $("#btnTalk").onclick = async ()=>{
    try{
      if(!mediaStream){
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio:true });
        $mic.textContent = "🎙️ Mic activo";
        ctx = new (window.AudioContext||window.webkitAudioContext)();
        source = ctx.createMediaStreamSource(mediaStream);
        analyser = ctx.createAnalyser(); analyser.fftSize=512; source.connect(analyser); vu();
      }
      mediaRec = new MediaRecorder(mediaStream, { mimeType:"audio/webm;codecs=opus" });
      chunks=[];
      mediaRec.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
      mediaRec.onstop = async ()=>{
        const blob = new Blob(chunks, { type:"audio/webm" }); chunks=[];
        await sendAudio(blob);
      };
      mediaRec.start();
      logger("🎤 Escuchando… (detén la grabación cerrando el panel o cambiando pestaña)");
    }catch(e){ logger("Error mic: "+e.message); setState("Error mic", false); }
  };
  $("#btnMute").onclick = ()=> muted = !muted;
  $("#btnSend").onclick = ()=> sendText($txt.value);

  async function playSandraFromText(text){
    if(!text?.trim()) return;
    log("Tú: "+text);
    $txt.value="";
    try{
      const r = await fetch('/.netlify/functions/tts',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text })
      });
      if(!r.ok){
        logger("⚠️ TTS error: " + await r.text());
        speakLocal("Tengo problemas para conectar, pero sigo aquí.");
        return;
      }
      const buf = await r.arrayBuffer();
      const url = URL.createObjectURL(new Blob([buf], {type:'audio/mpeg'}));
      logger("Sandra: 🔊 Reproduciendo respuesta");
      if(!muted) new Audio(url).play();
    }catch(e){
      logger("⚠️ Error servidor: "+e.message);
      speakLocal("Tengo problemas para conectar, pero sigo aquí.");
    }
  }

  async function sendText(text){
    if(!text.trim()) return;
    logger("Tú: " + text);
    $txt.value = "";
    const r = await fetch("/.netlify/functions/ask", {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ text })
    });
    if(!r.ok){ logger("Error servidor: "+r.status); return; }
    const buf = await r.arrayBuffer();
    const url = URL.createObjectURL(new Blob([buf], { type:"audio/mpeg" }));
    const a = new Audio(url);
    a.play().catch(()=>{ /* silencioso */ });
  }
  document.getElementById("btnSend").onclick = ()=> sendText($txt.value);

  // Exposer globalmente para el wire del botón
  window.playSandraFromText = playSandraFromText;

  async function sendAudio(blob){
    // Demo: enviamos audio al servidor si implementas STT; en este pack, respondemos texto
    const form = new FormData(); form.append("audio", blob, "input.webm");
    try{
      const r = await fetch(API_ORIGIN + "/.netlify/functions/reply", { method:"POST", body: JSON.stringify({ text: "Audio enviado (demo)." }), headers:{ "Content-Type":"application/json" } });
      const data = await r.json();
      const reply = data.reply || "Audio recibido (demo).";
      logger("Sandra: "+reply);
      speakLocal(reply);
    }catch(e){
      logger("⚠️ Error servidor: "+e.message);
      speakLocal("No pude procesar tu audio ahora mismo.");
    }
  }

  function speakLocal(text){
    try{
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "es-ES";
      if(!muted) window.speechSynthesis.speak(utter);
    }catch{ /* ignore */}
  }
})();
