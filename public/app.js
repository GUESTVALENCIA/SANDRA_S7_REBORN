
// --- Config ---
const API_BASE = "/api";
const TRAINING_KEY_PROMPT = "Introduce tu clave de entrenamiento";
const LS_KEY = "sandra_trainer_dataset_v1";

const $ = (sel)=>document.querySelector(sel);
const logEl = $("#chat-log");
function log(line, cls=""){ const div=document.createElement("div"); div.className="mono "+cls; div.textContent=line; logEl.appendChild(div); logEl.scrollTop=logEl.scrollHeight; }

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
    log("⚙️ Autoentreno iniciado");
    timer = setInterval(pushOne, Number($("#interval").value) * 1000);
  });
  $("#btn-stop").addEventListener("click", () => {
    if(timer){ clearInterval(timer); timer=null; log("⏹️ Autoentreno detenido"); }
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
      log(`⚠️ Entreno falló ${r.status} ${text}`, "error");
    }else{
      const res = await r.json().catch(()=>({ok:true}));
      log(`✅ Enviado ejemplo (${item.persona})`, "success");
    }
  }catch(e){
    log(`⚠️ Error de red en autoentreno: ${e.message}`, "error");
  }
}

async function sendChat(){
  await ensureKey();
  const text = $("#chat-text").value.trim();
  if(!text) return;
  const persona = $("#chat-persona").value;
  $("#chat-text").value = "";
  log(`Tú: ${text}`);

  try{
    const r = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Sandra-Key": SKEY },
      body: JSON.stringify({ text, persona })
    });
    if(r.headers.get("content-type")?.includes("audio/mpeg")){
      const buf = await r.arrayBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
      const a = new Audio(url);
      a.play();
      log("🔊 (audio MP3 de ElevenLabs)");
    }else{
      const data = await r.json();
      log(`Sandra: ${data.reply}`);
    }
  }catch(e){
    log(`⚠️ Error de red en chat: ${e.message}`, "error");
  }
}
