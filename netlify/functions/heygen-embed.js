// netlify/functions/heygen-embed.js
export const config = { path: "/api/heygen-embed" };

export default async (req, res) => {
  try {
    const { video_id, share_url } = req.body || {};
    // 1) Si ya pasas un share_url, lo convertimos a embed
    if (share_url) {
      const embed = share_url.replace("/share/", "/embeds/");
      return res.status(200).json({ ok: true, embedUrl: embed });
    }

    // 2) Si solo hay video_id, construimos un embed genérico de los permitidos por CSP
    if (video_id) {
      // Dos candidatos de embed permitidos. Probamos primero console, si falla el front hace fallback al otro.
      const embedCandidates = [
        `https://console.heygen.com/embeds/${encodeURIComponent(video_id)}`,
        `https://labs.heygen.com/embeds/${encodeURIComponent(video_id)}`
      ];
      return res.status(200).json({ ok: true, embedUrl: embedCandidates[0], fallback: embedCandidates[1] });
    }

    return res.status(400).json({ ok: false, error: "Falta video_id o share_url" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};