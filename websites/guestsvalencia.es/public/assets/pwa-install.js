let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault(); deferredPrompt=e;
  const btn=document.getElementById('install-app'); if(!btn) return;
  btn.disabled=false;
  btn.addEventListener('click', async ()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt=null; btn.disabled=true;
  }, {once:true});
});