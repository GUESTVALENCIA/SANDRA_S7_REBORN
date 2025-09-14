export default async (req) => {
  try {
    const { video_id, share_url } = await req.json().catch(() => ({}));
    if (share_url) {
      const embedUrl = share_url.replace("/share/","/embeds/");
      return new Response(JSON.stringify({ ok:true, embedUrl }), { status:200, headers:{ "content-type":"application/json" }});
    }
    if (video_id) {
      const embedUrl = `https://console.heygen.com/embeds/${encodeURIComponent(video_id)}`;
      return new Response(JSON.stringify({ ok:true, embedUrl }), { status:200, headers:{ "content-type":"application/json" }});
    }
    return new Response(JSON.stringify({ ok:false, error:"Falta video_id o share_url" }), { status:400, headers:{ "content-type":"application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:e.message }), { status:500, headers:{ "content-type":"application/json" }});
  }
};