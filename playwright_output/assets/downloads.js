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
    // Make sure iOS / Android / Windows / Mac OS cards are visible if they exist
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
  function injectFallbackGrid(){
    // If we cannot find Windows/Android/Mac OS cards, inject simple cards below the title
    const haveWindows = !!Array.from(document.querySelectorAll('p')).find(p => /^(Windows)$/i.test((p.textContent||'').trim()));
    const haveAndroid = !!Array.from(document.querySelectorAll('p')).find(p => /^(Android)$/i.test((p.textContent||'').trim()));
    const haveMac = !!Array.from(document.querySelectorAll('p')).find(p => /^(Mac\s*OS)$/i.test((p.textContent||'').trim()));
    if(haveWindows && haveAndroid && haveMac) return;

    const h2 = document.querySelector('h2, h1');
    const mount = h2 ? h2.parentElement : document.body;

    const grid = document.createElement('div');
    grid.id = 'dl-injected';
    grid.style.display = 'flex';
    grid.style.justifyContent = 'center';
    grid.style.gap = '20px';
    grid.style.marginTop = '32px';
    grid.style.flexWrap = 'wrap';

    function card(label){
      const wrap = document.createElement('div');
      wrap.className = 'dl-card';
      wrap.style.width = '260px';
      wrap.style.textAlign = 'center';
      wrap.style.padding = '10px';
      wrap.style.borderRadius = '12px';
      wrap.style.border = '1px solid #e5e7eb';
      wrap.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
      const img = document.createElement('div');
      img.style.height = '160px';
      img.style.background = '#e9eefb';
      img.style.borderRadius = '10px';
      img.style.margin = '0 auto 16px';
      wrap.appendChild(img);
      const p = document.createElement('p');
      p.textContent = label;
      p.style.fontWeight = '600';
      p.style.margin = '8px 0';
      wrap.appendChild(p);
      const cta = document.createElement('div');
      cta.className = 'cta';
      wrap.appendChild(cta);
      return {wrap, p, cta};
    }

    if(!haveAndroid){
      const {wrap, cta} = card('Android');
      const btn = document.createElement('button');
      btn.textContent = 'Unsupported device';
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.style.padding = '10px 14px';
      btn.style.borderRadius = '8px';
      btn.style.border = '0';
      btn.style.background = '#e5e7eb';
      cta.appendChild(btn);
      grid.appendChild(wrap);
    }

    if(!haveWindows){
      const {wrap, cta} = card('Windows');
      // placeholder; gating will replace with enabled link
      const btn = document.createElement('button');
      btn.id = 'winBtnDisabled';
      btn.textContent = 'Download @FlowusDesktop.exe';
      btn.disabled = true;
      btn.style.opacity = '0.3';
      btn.style.cursor = 'not-allowed';
      btn.style.padding = '10px 14px';
      btn.style.borderRadius = '8px';
      btn.style.border = '0';
      btn.style.background = '#000';
      btn.style.color = '#fff';
      cta.appendChild(btn);
      const msg = document.createElement('div');
      msg.id = 'downloadGateMsg';
      msg.style.fontSize = '12px';
      msg.style.marginTop = '8px';
      msg.style.color = '#6b7280';
      msg.textContent = 'Please register to enable downloads.';
      wrap.appendChild(msg);
      grid.appendChild(wrap);
    }

    if(!haveMac){
      const {wrap, cta} = card('Mac OS');
      const btn = document.createElement('button');
      btn.textContent = 'Unsupported device';
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.style.padding = '10px 14px';
      btn.style.borderRadius = '8px';
      btn.style.border = '0';
      btn.style.background = '#e5e7eb';
      cta.appendChild(btn);
      grid.appendChild(wrap);
    }

    // Mount grid after the title
    if(mount){ mount.appendChild(grid); }
  }

  function findWindowsControls(){
    // Find the "Windows" card controls regardless of original structure
    const labels = Array.from(document.querySelectorAll('p'));
    const winLabel = labels.find(p => /^(Windows)$/i.test((p.textContent||'').trim()));
    if(!winLabel) return {};
    const card = winLabel.closest('.group') || winLabel.closest('.dl-card') || winLabel.parentElement;
    if(!card) return {};
    const btn = card.querySelector('#winBtnDisabled') || card.querySelector('button');
    const link = card.querySelector('#winDownloadLink') || card.querySelector('a');
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
    a.style.display = 'inline-flex';
    a.style.alignItems = 'center';
    a.style.justifyContent = 'center';
    a.style.padding = '10px 14px';
    a.style.borderRadius = '8px';
    a.style.background = '#000';
    a.style.color = '#fff';
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
    b.style.padding = '10px 14px';
    b.style.borderRadius = '8px';
    b.style.border = '0';
    b.style.background = '#000';
    b.style.color = '#fff';
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
    injectFallbackGrid();

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
