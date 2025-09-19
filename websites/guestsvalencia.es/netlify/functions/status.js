// Status + latencias en ms para gateway/tts/avatar
// Config por env: GATEWAY, HEALTH_PATH, HEALTH_TTS_PATH, HEALTH_AVATAR_PATH, TIMEOUT_MS

const DEFAULT_TIMEOUT = parseInt(process.env.TIMEOUT_MS || "3500", 10);

function abortableFetch(url, opts = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() =>
    clearTimeout(t)
  );
}

async function probe(name, url, init = {}) {
  const t0 = performance.now();
  try {
    const res = await abortableFetch(url, init);
    const ok = res.ok;
    const t1 = performance.now();
    return { name, ok, ms: Math.round(t1 - t0), status: res.status };
  } catch (e) {
    const t1 = performance.now();
    return { name, ok: false, ms: Math.round(t1 - t0), error: e.message ?? String(e) };
  }
}

exports.handler = async () => {
  const gw = (process.env.GATEWAY || "https://guestsvalencia.es").replace(/\/+$/, "");

  const healthPath = process.env.HEALTH_PATH || "/api/health";
  const ttsPath = process.env.HEALTH_TTS_PATH || "/api/tts";
  const avatarPath = process.env.HEALTH_AVATAR_PATH || "/api/speech-lite";

  const checks = [
    probe("gateway", `${gw}${healthPath}`),
    probe("tts", `${gw}${ttsPath}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "test" })
    }),
    probe("avatar", `${gw}${avatarPath}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "test" })
    }),
  ];

  const results = await Promise.all(checks);
  const up = results.every(r => r.ok);

  const body = JSON.stringify({
    up,
    at: new Date().toISOString(),
    gateway: gw,
    results, // [{name, ok, ms, status?, error?}]
  });

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
    body
  };
};