// Download gating script (simplified)
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

  function findWindowsButton(){
    // Locate the Windows tile by text; return its button/link
    const pTags = Array.from(document.querySelectorAll('p'));
    console.log('[Downloads] Found p tags:', pTags.length);
    const winP = pTags.find(p => /^Windows$/i.test((p.textContent||'').trim()));
    console.log('[Downloads] Windows p tag:', winP);
    if(!winP) {
      // Try alternative: look for any element containing "Windows"
      const allElements = Array.from(document.querySelectorAll('*'));
      const winElement = allElements.find(el => {
        const text = (el.textContent || '').trim();
        return text === 'Windows' || text === 'Window';
      });
      console.log('[Downloads] Alternative Windows element:', winElement);
      if(winElement) {
        const card = winElement.closest('div') || winElement.parentElement;
        const btn = card ? (card.querySelector('button') || card.querySelector('a')) : null;
        console.log('[Downloads] Found button via alternative:', btn);
        return btn;
      }
      return null;
    }
    const card = winP.closest('div') || winP.parentElement;
    if(!card) return null;
    return card.querySelector('button') || card.querySelector('a');
  }

  function enableWindowsDownload(){
    const btn = findWindowsButton();
    console.log('[Downloads] enableWindowsDownload - button found:', btn);
    if(!btn) {
      console.log('[Downloads] ERROR: Windows button not found!');
      return;
    }
    const href = resolveWinUrl();
    console.log('[Downloads] Download URL:', href);
    // Replace button with link
    const a = document.createElement('a');
    a.href = href;
    a.setAttribute('download', 'FlowusDesktop.exe');
    a.className = btn.className || '';
    a.style.cssText = btn.style.cssText || '';
    a.style.opacity = '1';
    a.style.cursor = 'pointer';
    a.textContent = btn.textContent || 'Download';
    a.removeAttribute('disabled');
    btn.replaceWith(a);
  }

  function disableWindowsDownload(){
    const existing = findWindowsButton();
    if(!existing) return;
    // If it's a link, replace with disabled button
    if(existing.tagName.toLowerCase() === 'a'){
      const b = document.createElement('button');
      b.className = existing.className || '';
      b.style.cssText = existing.style.cssText || '';
      b.disabled = true;
      b.style.opacity = '0.3';
      b.style.cursor = 'not-allowed';
      b.textContent = existing.textContent || 'Download';
      existing.replaceWith(b);
    } else {
      // It's already a button; ensure it's disabled
      existing.disabled = true;
      existing.style.opacity = '0.3';
      existing.style.cursor = 'not-allowed';
    }
  }

  function scrollToWindows(){
    const btn = findWindowsButton();
    if(btn){ btn.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  function gate(){
    const has = hasAccount();
    console.log('[Downloads] gate() - hasAccount:', has);
    if(has) enableWindowsDownload(); else disableWindowsDownload();

    if(window.location.search.indexOf('workflow=') !== -1 || window.location.hash === '#win'){
      setTimeout(scrollToWindows, 200);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', gate);
  } else { gate(); }
  
  // Aggressive retry - download tiles may be rendered late by React
  var retries = 0;
  var maxRetries = 30;
  var retryInterval = setInterval(function(){
    retries++;
    gate();
    if(retries >= maxRetries) clearInterval(retryInterval);
  }, 200);
})();
