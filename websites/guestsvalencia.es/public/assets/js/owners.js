(function(){
  // WhatsApp cableado (propietarios) 624829117
  const WA = '+34624829117';
  function waLink(msg){
    return 'https://wa.me/' + WA.replace(/\D/g,'') + (msg? ('?text='+encodeURIComponent(msg)) : '');
  }
  const wa1=document.getElementById('cta-wa-owners');
  const wa2=document.getElementById('cta-wa-owners-2');
  if (wa1) wa1.href = waLink('Hola, soy propietario. Quiero presupuesto de gestion flexible (fines de semana / entre semana).');
  if (wa2) wa2.href = waLink('Hola, soy propietario. Quiero presupuesto de gestion para mi vivienda.');

  // Calculadora
  const rate = document.getElementById('rate');
  const occ_we = document.getElementById('occ_we');
  const occ_wd = document.getElementById('occ_wd');
  const fee = document.getElementById('fee');
  const out = document.getElementById('calc-out');
  const btn = document.getElementById('calc');
  function calc(){
    const r = parseFloat(rate.value||'0');
    const we = Math.max(0, Math.min(100, parseFloat(occ_we.value||'0'))) / 100;  // 12 noches aprox/mes
    const wd = Math.max(0, Math.min(100, parseFloat(occ_wd.value||'0'))) / 100;  // 18 noches aprox/mes
    const nights_we = 12, nights_wd = 18, nights = nights_we + nights_wd;
    const gross = r * (we*nights_we + wd*nights_wd);
    const feePct = Math.max(0, Math.min(100, parseFloat(fee.value||'0'))) / 100;
    const mgmt = gross * feePct;
    const net = gross - mgmt;
    out.textContent = JSON.stringify({
      tarifa_noche: r, ocupacion_we: we, ocupacion_wd: wd, noches_mes: nights,
      ingresos_brutos: Math.round(gross*100)/100,
      fee_gestion: Math.round(mgmt*100)/100,
      ingresos_netos_estimados: Math.round(net*100)/100
    }, null, 2);
  }
  if (btn) btn.addEventListener('click', calc);

  // Form propietarios -> Netlify Forms + abre WhatsApp
  const form = document.getElementById('form-owners');
  const msg = document.getElementById('owners-msg');
  if (form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      msg.textContent = 'Enviando…';
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(Object.fromEntries([...fd, ['form-name','owners-lead']])).toString()
      }).catch(()=>{});
      msg.textContent = '¡Recibido! Te contactamos en breve.';
      const text = `Hola, soy propietario:\nNombre: ${fd.get('name')}\nTel.: ${fd.get('phone')}\nDireccion: ${fd.get('address')}\nNotas: ${fd.get('notes')||''}`;
      window.open(waLink(text), '_blank');
    });
  }
})();