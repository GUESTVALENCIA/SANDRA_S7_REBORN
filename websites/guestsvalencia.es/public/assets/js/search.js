(async function(){
  const params = new URLSearchParams(location.search);
  const q = params.get('q')||'';
  const guests = parseInt(params.get('guests')||'1',10);
  const rooms = parseInt(params.get('rooms')||'1',10);
  const nights = parseInt(params.get('nights')||'1',10);

  document.getElementById('q').value = q;
  document.getElementById('guests').value = guests;
  document.getElementById('rooms').value = rooms;

  const r = await fetch('/data/listings.json',{cache:'no-store'});
  const all = await r.json();

  // Filtro simple por capacidad
  const list = all.filter(a => (a.guests>=guests) && (a.bedrooms>=rooms));
  render(list);

  function render(arr){
    const grid = document.getElementById('results'); grid.innerHTML='';
    arr.forEach(a=>{
      const card = document.createElement('a');
      card.href = `/listing.html?id=${encodeURIComponent(a.id)}&nights=${nights}`;
      card.className = "block rounded-2xl border bg-white shadow-sm overflow-hidden";
      card.innerHTML = `
        <div class="relative">
          <img src="${(a.photos&&a.photos[0])||'/images/placeholder.jpg'}" class="w-full h-44 object-cover" alt="${a.title}">
          ${a.auto_checkin?'<span class="absolute top-2 left-2 text-xs rounded-full bg-black/60 text-white px-2 py-1">Llegada autónoma</span>':''}
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">${a.title}</h3>
            <span class="text-slate-900 font-bold">€${a.price_night}/noche</span>
          </div>
          <p class="text-sm text-slate-600 mt-1">${a.bedrooms} hab · hasta ${a.guests} huéspedes</p>
          <p class="text-xs text-slate-500 mt-2">${(a.features||[]).slice(0,3).join(' · ')}</p>
        </div>`;
      grid.appendChild(card);
    });
    if(arr.length===0){
      grid.innerHTML = `<div class="text-center text-slate-600">No encontramos alojamientos con esos filtros.</div>`;
    }
  }

  // Refiltrar sin recargar
  document.getElementById('filters').addEventListener('submit', (e)=>{
    e.preventDefault();
    const g = parseInt(document.getElementById('guests').value,10);
    const r = parseInt(document.getElementById('rooms').value,10);
    const out2 = all.filter(a => (a.guests>=g) && (a.bedrooms>=r));
    render(out2);
  });
})();