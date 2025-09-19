(function(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const nights = parseInt(params.get('nights')||'1',10);

  const price = document.getElementById('price');
  const title = document.getElementById('title');
  const gallery = document.getElementById('gallery');
  const feat = document.getElementById('features');
  const map = document.getElementById('map');
  const summary = document.getElementById('summary');
  const epBtn = document.getElementById('easypay');
  const badgeAuto = document.getElementById('badge-auto');

  fetch('/data/listings.json').then(r=>r.json()).then(all=>{
    const a = all.find(x=>x.id===id) || all[0];

    title.textContent = a.title;
    price.textContent = `€${a.price_night}/noche`;
    summary.textContent = `${a.bedrooms} hab · hasta ${a.guests} huéspedes${a.auto_checkin?' · Llegada autónoma':''}`;
    if (a.auto_checkin) badgeAuto.classList.remove('hidden');

    (a.photos||[]).forEach(src=>{
      const img = document.createElement('img');
      img.src = src; img.alt = a.title; img.loading="lazy";
      img.className="w-full h-52 object-cover rounded-xl";
      gallery.appendChild(img);
    });
    (a.features||[]).forEach(f=>{
      const li = document.createElement('li'); li.textContent = f; li.className="text-sm";
      feat.appendChild(li);
    });

    // Mapa OpenStreetMap (sin claves)
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${a.lng-0.01}%2C${a.lat-0.01}%2C${a.lng+0.01}%2C${a.lat+0.01}&layer=mapnik&marker=${a.lat}%2C${a.lng}`;
    const iframe = document.createElement('iframe');
    iframe.src = url; iframe.className="w-full h-64 rounded-xl border"; iframe.loading="lazy";
    map.appendChild(iframe);

    // Easy Pay → WhatsApp (resumen). Si tienes TPV, aquí rediriges a Stripe/Redsys.
    epBtn.addEventListener('click', ()=>{
      const msg = `Easy Pay · Reserva ${a.title}\nNoches: ${nights}\nPrecio estimado: €${a.price_night*nights}\nLlegada autónoma: ${a.auto_checkin?'Sí':'No'}`;
      const wa = 'https://wa.me/34624829117?text='+encodeURIComponent(msg);
      window.open(wa, '_blank');
    });
  });
})();