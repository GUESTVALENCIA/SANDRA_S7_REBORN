(function(){
  const cfg = window.SANDRA_CONFIG || {};
  const $ = (sel)=>document.querySelector(sel);
  const logEl = $("#chat-log");
  const inputEl = $("#chat-input");
  const statusEl = $("#voice-status");
  const avatarFrame = $("#avatar-frame");
  let recognizing = false;
  let recognition = null;

  const append = (role, text) => {
    const div = document.createElement("div");
    div.className = "msg " + (role === "user" ? "me" : "ai");
    div.textContent = (role==="user"?"Tú: ":"Sandra: ") + text;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  };

  async function __sandraPing(){
    try{
      const r = await fetch(cfg.CHAT_ENDPOINT, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message:"ping", language: cfg.LANGUAGE })
      });
      return await r.json();
    }catch(e){ return { error: String(e) }; }
  }
  window.__sandraPing = __sandraPing;

  async function sendText(){
    const msg = inputEl.value.trim();
    if(!msg) return;
    append("user", msg);
    inputEl.value = "";
    try{
      const r = await fetch(cfg.CHAT_ENDPOINT, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ message: msg, language: cfg.LANGUAGE })
      });
      const data = await r.json();
      const reply = data.reply || data.message || JSON.stringify(data);
      append("assistant", reply);
      speak(reply);
    }catch(e){
      append("assistant", "Error de red: " + e);
    }
  }

  function speak(text){
    try{
      const synth = window.speechSynthesis;
      if(!synth){ return; }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = (cfg.LANGUAGE || "es").startsWith("en") ? "en-US" : "es-ES";
      synth.cancel();
      synth.speak(utter);
    }catch(_){/* ignore */}
  }

  function initRecognition(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ statusEl && (statusEl.textContent = "Reconocimiento no soportado en este navegador."); return null; }
    const rec = new SR();
    rec.lang = (cfg.LANGUAGE || "es").startsWith("en") ? "en-US" : "es-ES";
    rec.continuous = true; rec.interimResults = true;
    rec.onstart = ()=>{ recognizing = true; statusEl.textContent = "🎙️ Grabando..."; };
    rec.onend = ()=>{ recognizing = false; statusEl.textContent = "⏹️ Parado"; };
    rec.onerror = (e)=>{ statusEl.textContent = "⚠️ Error: " + e.error; };
    let lastFinal = "";
    rec.onresult = (ev)=>{
      let interim = "", final = "";
      for(let i=ev.resultIndex;i<ev.results.length;i++){
        const r = ev.results[i];
        (r.isFinal ? final : interim) += r[0].transcript;
      }
      if(final){
        lastFinal = final.trim();
        inputEl.value = lastFinal;
      }
      statusEl.textContent = interim ? "🎙️ " + interim : (recognizing ? "🎙️ Escuchando..." : "Listo");
    };
    return rec;
  }

  function startDictation(){
    if(!recognition){ recognition = initRecognition(); }
    if(!recognition) return;
    try{ recognition.start(); }catch(_){/* already started */}
  }
  function stopDictation(){
    if(recognition){ recognition.stop(); }
    if(inputEl.value.trim()) sendText();
  }

  function loadAvatar(){
    if(!cfg.AVATAR_IFRAME_URL){ alert("Configura AVATAR_IFRAME_URL en config.js"); return; }
    avatarFrame.src = cfg.AVATAR_IFRAME_URL;
  }
  function sendAvatarCommand(cmd){
    if(!avatarFrame.contentWindow){ return; }
    avatarFrame.contentWindow.postMessage({ type:"sandra:command", data: cmd }, "*");
  }

  const SandraUI = {
    show(which){
      ["text","voice","avatar"].forEach(id=>{
        const el = document.getElementById("panel-"+id);
        if(!el) return;
        if(id===which) el.classList.remove("hidden"); else el.classList.add("hidden");
      });
    }
  };
  const SandraAPI = { sendText, speak, startDictation, stopDictation, loadAvatar, sendAvatarCommand };

  window.SandraUI = SandraUI;
  window.SandraAPI = SandraAPI;

  // Warmup + banner
  console.log("👋 Sandra S7 Reborn · cfg:", cfg);
  __sandraPing().then(r=>console.log("ping:", r));
})();