// Device detection and platform-specific UI
(function(){
  function detectPlatform(){
    const ua = navigator.userAgent || '';
    if(/Mac|iPhone|iPad|iPod/i.test(ua)) return 'mac';
    if(/Win/i.test(ua)) return 'windows';
    if(/Android/i.test(ua)) return 'android';
    if(/Linux/i.test(ua)) return 'linux';
    return 'windows'; // default
  }
  function scrollToCard(platform){
    const pTags = Array.from(document.querySelectorAll('p'));
    let target = null;
    if(platform === 'mac') target = pTags.find(p => /^Mac\s*OS$/i.test((p.textContent||'').trim()));
    else if(platform === 'windows') target = pTags.find(p => /^Windows$/i.test((p.textContent||'').trim()));
    else if(platform === 'android') target = pTags.find(p => /^Android$/i.test((p.textContent||'').trim()));
    if(target){ target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
  function init(){
    const platform = detectPlatform();
    setTimeout(function(){ scrollToCard(platform); }, 150);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

