// Download gating script
(function(){
  function getCookie(name){
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g,'\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function hasAccount(){
    try { if(localStorage.getItem('flowusAccount')) return true; } catch(e){}
    return !!getCookie('flowusOrg');
  }
  function resolveWinUrl(){
    try {
      const qp = new URLSearchParams(location.search);
      const fromQuery = qp.get('win');
      const fromLs = localStorage.getItem('winDlUrl');
      return (fromQuery && fromQuery.trim()) || (fromLs && fromLs.trim()) || './assets/FlowusDesktop.exe';
    } catch(e){ return './assets/FlowusDesktop.exe'; }
  }
  function ensureTilesVisible(){
    const labels = Array.from(document.querySelectorAll('p'));
    const wanted = /(^(iOS|Android|Windows|Mac\s*OS)$)/i;
    labels.forEach(p => {
      const txt = (p.textContent||'').trim();
      if(wanted.test(txt)){
        const card = p.closest('.group') || p.closest('div');
        if(card){ card.style.display = ''; card.classList.remove('hidden'); }
      }
    });
  }
  function findWindowsControls(){
    const labels = Array.from(document.querySelectorAll('p'));
    const winLabel = labels.find(p => /^(Windows)$/i.test((p.textContent||'').trim()));
    if(!winLabel) return {};
    const card = winLabel.closest('.group') || winLabel.parentElement;
    if(!card) return {};
    const btn = card.querySelector('button');
    const link = card.querySelector('a');
    return { card, winLabel, btn, link };
  }
  function enableWindowsDownload(){
    const { card, btn, link } = findWindowsControls();
    if(!card) return;
    const href = resolveWinUrl();
    let a = link;
    if(!a){
      a = document.createElement('a');
      a.className = btn ? btn.className : 'h-10 rounded bg-black text-white flex font-semibold items-center justify-center text-[16px] w-[141px] mx-auto mt-5';
      if(btn) btn.replaceWith(a); else card.appendChild(a);
    }
    a.id = 'winDownloadLink';
    a.href = href;
    a.setAttribute('download', 'FlowusDesktop.exe');
    a.style.display = 'flex';
    a.innerHTML = '<span class="mr-2">Download @FlowusDesktop.exe</span>';
    a.removeAttribute('disabled');
    a.style.opacity = '';
    a.style.cursor = 'pointer';
    const msg = document.getElementById('downloadGateMsg');
    if(msg) msg.textContent = 'Download is enabled for your registered device.';
  }
  function disableWindowsDownload(){
    const { card, btn, link } = findWindowsControls();
    if(!card) return;
    let b = btn;
    if(link){
      b = document.createElement('button');
      b.className = link.className;
      link.replaceWith(b);
    }
    if(!b){
      b = document.createElement('button');
      b.className = 'h-10 rounded bg-black text-white flex font-semibold items-center justify-center text-[16px] w-[141px] mx-auto mt-5';
      card.appendChild(b);
    }
    b.id = 'winBtnDisabled';
    b.disabled = true;
    b.style.opacity = '0.3';
    b.style.cursor = 'not-allowed';
    b.innerHTML = '<span class="mr-2">Download @FlowusDesktop.exe</span>';
    b.title = 'Please register to enable downloads.';
    b.addEventListener('click', function(e){ e.preventDefault(); });
    let msg = document.getElementById('downloadGateMsg');
    if(!msg){
      msg = document.createElement('div');
      msg.id = 'downloadGateMsg';
      msg.className = 'text-center mt-2 text-t4-medium';
      card.appendChild(msg);
    }
    msg.innerHTML = 'Please <a href="login.html" style="text-decoration:underline">register</a> to enable downloads.';
  }
  function scrollToWindows(){
    const { btn, link } = findWindowsControls();
    const target = link || btn;
    if(target){ target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
  function gate(){
    ensureTilesVisible();

    const has = hasAccount();
    if(has) enableWindowsDownload(); else disableWindowsDownload();

    if(window.location.search.indexOf('workflow=') !== -1 || window.location.hash === '#win'){
      setTimeout(scrollToWindows, 200);
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', gate);
  } else { gate(); }
})();
