// Profile personalization script (persistent per device)
(function(){
  function getCookie(name){
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g,'\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function getAccount(){
    try { return JSON.parse(localStorage.getItem('flowusAccount')||'null'); } catch(e){ return null; }
  }
  function setAccount(acc){
    try {
      localStorage.setItem('flowusAccount', JSON.stringify(acc));
      document.cookie = `flowusOrg=${encodeURIComponent(acc.org)}; path=/; max-age=${60*60*24*30}`; // 30 days
    } catch(e) {}
  }
  function resolveWinUrl(){
    try {
      const qp = new URLSearchParams(location.search);
      const fromQuery = qp.get('win');
      const fromLs = localStorage.getItem('winDlUrl');
      return (fromQuery && fromQuery.trim()) || (fromLs && fromLs.trim()) || './assets/FlowusDesktop.exe';
    } catch(e){ return './assets/FlowusDesktop.exe'; }
  }
  function normalizeSpace(s){ return (s||'').replace(/\s+/g,' ').trim(); }

  function replaceLoginRegister(org){
    // Replace any anchor/button that reads Login/Register or points to login.html
    const nodes = Array.from(document.querySelectorAll('a, button'));
    let replaced = 0;
    nodes.forEach(el => {
      const text = normalizeSpace(el.textContent);
      const href = (el.getAttribute('href')||'');
      // More flexible matching
      if (text.includes('Login') || text.includes('Register') || /login\.html/i.test(href)){
        el.textContent = `~${org}`;
        if (el.tagName.toLowerCase() === 'a') el.setAttribute('href', '#');
        el.addEventListener('click', function(e){ e.preventDefault(); togglePanel(); });
        replaced++;
      }
    });
    console.log(`[FlowUs Profile] Replaced ${replaced} Login/Register buttons with ~${org}`);
  }

  function buildPanel(account){
    let panel = document.getElementById('flowusProfilePanel');
    if(panel) { panel.remove(); }
    panel = document.createElement('div');
    panel.id = 'flowusProfilePanel';
    panel.style.position = 'fixed';
    panel.style.top = '90px';
    panel.style.right = '20px';
    panel.style.background = '#fff';
    panel.style.border = '1px solid #e5e7eb';
    panel.style.borderRadius = '10px';
    panel.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)';
    panel.style.padding = '16px 18px';
    panel.style.zIndex = '9999';
    panel.style.minWidth = '260px';
    const winUrl = resolveWinUrl();
    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-weight:700; font-size:16px;">~${account.org}</div>
        <button id="flowusProfileClose" style="border:none;background:transparent;font-size:16px;cursor:pointer;color:#9ca3af">×</button>
      </div>
      <div style="margin-top:6px; font-size:14px; color:#6b7280;">Assigned position</div>
      <div style="margin-top:2px; font-size:14px;">${account.role || 'Member'}</div>
      <a id="flowusDirectDownload" href="download.html?workflow=${(account.org||'').toLowerCase()}#win" style="display:block; margin-top:12px; background:#000; color:#fff; text-align:center; padding:10px 12px; border-radius:8px; text-decoration:none;">Download ${account.org} workflow</a>
      <div style="margin-top:8px; font-size:12px; color:#9ca3af;">Personalized to this device</div>
    `;
    document.body.appendChild(panel);
    document.getElementById('flowusProfileClose').addEventListener('click', function(){ panel.remove(); });
  }

  function togglePanel(){
    const panel = document.getElementById('flowusProfilePanel');
    if(panel){ panel.remove(); return; }
    const acc = getAccount();
    if(acc) buildPanel(acc);
  }

  function personalize(){
    // Load account either from localStorage or cookie-only fallback
    let account = getAccount();
    const orgCookie = getCookie('flowusOrg');
    if(!account && orgCookie){ account = { org: orgCookie, role: 'Member' }; setAccount(account); }
    if(!account) {
      console.log('[FlowUs Profile] No account found');
      return; // nothing to do
    }
    console.log('[FlowUs Profile] Account found:', account);
    replaceLoginRegister(account.org);
    // Show compact profile by default once per page load
    buildPanel(account);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', personalize);
  } else {
    personalize();
  }
  
  // Re-check after a short delay to catch late localStorage updates
  setTimeout(function(){
    const acc = getAccount();
    if(acc && document.querySelector('a, button')){ 
      personalize(); 
    }
  }, 500);
})();
