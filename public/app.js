
// --- Config ---
const API_BASE = "/api";
const TRAINING_KEY_PROMPT = "Introduce tu clave de entrenamiento";
const LS_KEY = "sandra_trainer_dataset_v1";

const $ = (sel)=>document.querySelector(sel);
const logEl = $("#chat-log");
function writeLog(line, cls=""){ const div=document.createElement("div"); div.className="mono "+cls; div.textContent=line; logEl.appendChild(div); logEl.scrollTop=logEl.scrollHeight; }

// Keep session key
let SKEY = sessionStorage.getItem("SKEY") || "";
async function ensureKey(){
  if(!SKEY){
    SKEY = prompt(TRAINING_KEY_PROMPT) || "";
    sessionStorage.setItem("SKEY", SKEY);
  }
}

// Dataset store in localStorage for now
function loadDataset(){ try{ return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }catch{ return [] } }
function saveDataset(ds){ localStorage.setItem(LS_KEY, JSON.stringify(ds)); $("#count").textContent = String(ds.length); }

// UI Init
document.addEventListener("DOMContentLoaded", () => {
  // counts
  $("#count").textContent = String(loadDataset().length);

  // persona switch
  $("#persona").addEventListener("change", e => {
    $("#persona-badge").textContent = e.target.value;
  });

  // add sample
  $("#btn-add").addEventListener("click", () => {
    const inText = $("#in-text").value.trim();
    const outText = $("#out-text").value.trim();
    if(!inText || !outText){ alert("Rellena entrada y salida"); return; }
    const persona = $("#persona").value;
    const tags = $("#tags").value.trim().split(",").map(s=>s.trim()).filter(Boolean);
    const ds = loadDataset();
    ds.push({ input: inText, output: outText, persona, tags, ts: Date.now() });
    saveDataset(ds);
    $("#in-text").value = ""; $("#out-text").value = ""; $("#tags").value = "";
    renderList();
  });

  // export
  $("#btn-export").addEventListener("click", () => {
    const ds = loadDataset();
    if(!ds.length){ alert("No hay ejemplos"); return; }
    // JSONL format
    const lines = ds.map(x => JSON.stringify({ prompt: x.input, completion: x.output, meta: { persona: x.persona, tags: x.tags, ts: x.ts } })).join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sandra_train.jsonl";
    a.click();
  });

  // clear
  $("#btn-clear").addEventListener("click", () => {
    if(confirm("¿Borrar dataset local?")){ saveDataset([]); renderList(); }
  });

  // auto-train
  let timer = null;
  $("#btn-start").addEventListener("click", async () => {
    await ensureKey();
    if(timer){ return; }
    writeLog("⚙️ Autoentreno iniciado");
    timer = setInterval(pushOne, Number($("#interval").value) * 1000);
  });
  $("#btn-stop").addEventListener("click", () => {
    if(timer){ clearInterval(timer); timer=null; writeLog("⏹️ Autoentreno detenido"); }
  });

  // chat send
  $("#chat-send").addEventListener("click", sendChat);
  $("#chat-text").addEventListener("keydown", e => {
    if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); sendChat(); }
  });

  renderList();
});

function renderList(){
  const ds = loadDataset();
  const host = $("#list");
  host.innerHTML = "";
  ds.slice().reverse().forEach((x, idx) => {
    const d = document.createElement("div");
    d.className = "list-item";
    d.innerHTML = `<div class="small">#${ds.length-idx} · <span class="badge">${x.persona}</span> · ${new Date(x.ts).toLocaleString()}</div>
                   <div class="mono">→ ${x.input}</div>
                   <div class="mono success">← ${x.output}</div>`;
    host.appendChild(d);
  });
  $("#count").textContent = String(ds.length);
}

async function pushOne(){
  const ds = loadDataset();
  if(!ds.length){ return; }
  const item = ds.shift();
  saveDataset(ds);
  renderList();
  try{
    const r = await fetch(`${API_BASE}/train`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Sandra-Key": SKEY },
      body: JSON.stringify(item)
    });
    if(!r.ok){
      const text = await r.text();
      writeLog(`⚠️ Entreno falló ${r.status} ${text}`, "error");
    }else{
      const res = await r.json().catch(()=>({ok:true}));
      writeLog(`✅ Enviado ejemplo (${item.persona})`, "success");
    }
  }catch(e){
    writeLog(`⚠️ Error de red en autoentreno: ${e.message}`, "error");
  }
}


// Avatar instancelet avatarInstance = null;async function initializeAvatar() {  if (!avatarInstance) {    avatarInstance = new SandraAvatar();    const initialized = await avatarInstance.initialize();    if (initialized) {      writeLog("🤖 Avatar inicializado", "success");      return await avatarInstance.createSession();    }    return false;  }  return true;}async function sendChat(){  await ensureKey();  const text = $("#chat-text").value.trim();  if(!text) return;  const persona = $("#chat-persona").value;  $("#chat-text").value = "";  writeLog(`Tú: ${text}`);  try{    const payload = { text, persona };    // 1º intenta /api/chat    let res = await fetch("/api/chat", {      method: "POST",      headers: {"Content-Type":"application/json", "X-Sandra-Key": SKEY},      body: JSON.stringify(payload)    });    // si 404 (redirect roto), prueba directo a /.netlify/functions/chat    if (res.status === 404) {      res = await fetch("/.netlify/functions/chat", {        method: "POST",        headers: {"Content-Type":"application/json"},        body: JSON.stringify({ text })      });    }    if (!res.ok) {      const t = await res.text().catch(()=>res.statusText);      throw new Error(`Error chat ${res.status}: ${t.slice(0,120)}`);    }        // Get text response for avatar    const responseText = await res.text();        // Initialize avatar if needed    if (!avatarInstance) {      await initializeAvatar();    }        // Make avatar speak if connected    if (avatarInstance && avatarInstance.isConnected) {      await avatarInstance.speak(responseText);      writeLog("🤖 Sandra (Avatar respondiendo)");    } else {      // Fallback to audio if avatar not available      const buf = await res.arrayBuffer();      const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));      new Audio(url).play();      writeLog("🔊 (Sandra respondiendo por audio)");    }  }catch(e){    writeLog(`⚠️ Error de red en chat: ${e.message}`);  }}

// Avatar instancelet avatarInstance = null;async function initializeAvatar() {  if (!avatarInstance) {    avatarInstance = new SandraAvatar();    const initialized = await avatarInstance.initialize();    if (initialized) {      writeLog("🤖 Avatar inicializado", "success");      return await avatarInstance.createSession();    }    return false;  }  return true;}async function sendChat(){  await ensureKey();  const text = $("#chat-text").value.trim();  if(!text) return;  const persona = $("#chat-persona").value;  $("#chat-text").value = "";  writeLog(`Tú: ${text}`);  try{    const payload = { text, persona };    // 1º intenta /api/chat    let res = await fetch("/api/chat", {      method: "POST",      headers: {"Content-Type":"application/json", "X-Sandra-Key": SKEY},      body: JSON.stringify(payload)    });    // si 404 (redirect roto), prueba directo a /.netlify/functions/chat    if (res.status === 404) {      res = await fetch("/.netlify/functions/chat", {        method: "POST",        headers: {"Content-Type":"application/json"},        body: JSON.stringify({ text })      });    }    if (!res.ok) {      const t = await res.text().catch(()=>res.statusText);      throw new Error(`Error chat ${res.status}: ${t.slice(0,120)}`);    }        // Get text response for avatar    const responseText = await res.text();        // Initialize avatar if needed    if (!avatarInstance) {      await initializeAvatar();    }        // Make avatar speak if connected    if (avatarInstance && avatarInstance.isConnected) {      await avatarInstance.speak(responseText);      writeLog("🤖 Sandra (Avatar respondiendo)");    } else {      // Fallback to audio if avatar not available      const buf = await res.arrayBuffer();      const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));      new Audio(url).play();      writeLog("🔊 (Sandra respondiendo por audio)");    }  }catch(e){    writeLog(`⚠️ Error de red en chat: ${e.message}`);  }}

// Avatar Controls
document.addEventListener("DOMContentLoaded", () => {
  // Avatar connect button
  $("#avatar-connect")?.addEventListener("click", async () => {
    writeLog("🔄 Conectando avatar...");
    const connected = await initializeAvatar();
    if (connected) {
      writeLog("✅ Avatar conectado exitosamente", "success");
      $("#avatar-connect").disabled = true;
      $("#avatar-disconnect").disabled = false;
    } else {
      writeLog("❌ Error conectando avatar", "error");
    }
  });

  // Avatar disconnect button  
  $("#avatar-disconnect")?.addEventListener("click", async () => {
    if (avatarInstance) {
      await avatarInstance.disconnect();
      writeLog("🔌 Avatar desconectado");
      $("#avatar-connect").disabled = false;
      $("#avatar-disconnect").disabled = true;
    }
  });

  // Initialize disconnect button as disabled
  if ($("#avatar-disconnect")) {
    $("#avatar-disconnect").disabled = true;
  }
});
