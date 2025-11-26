// Download gating script - SIMPLIFIED VERSION
console.log('[Downloads] ========== SCRIPT START ==========');

(function(){
  console.log('[Downloads] IIFE executing');
  
  function hasAccount(){
    try {
      const ls = localStorage.getItem('flowusAccount');
      console.log('[Downloads] localStorage check:', ls);
      if(ls) return true;
    } catch(e){ console.error('[Downloads] localStorage error:', e); }
    
    const cookie = document.cookie.match(/flowusOrg=([^;]+)/);
    console.log('[Downloads] cookie check:', cookie);
    return !!cookie;
  }

  function enableDownload(){
    console.log('[Downloads] enableDownload called');
    // Find all buttons with the disabled state
    const buttons = document.querySelectorAll('button[disabled], a[disabled]');
    console.log('[Downloads] Found disabled buttons:', buttons.length);
    
    buttons.forEach(function(btn){
      const text = btn.getAttribute('title') || btn.textContent || '';
      console.log('[Downloads] Checking button:', text.substring(0, 50));
      
      if(text.includes('register') || text.includes('Please register')){
        console.log('[Downloads] FOUND THE REGISTER BUTTON! Enabling...');
        
        // Create new download link
        const newLink = document.createElement('a');
        newLink.href = './assets/FlowusDesktop.exe';
        newLink.download = 'FlowusDesktop.exe';
        newLink.textContent = 'Download';
        newLink.className = btn.className;
        newLink.style.cssText = 'padding: 10px 14px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; cursor: pointer; display: inline-block;';
        
        // Replace button with link
        btn.parentNode.replaceChild(newLink, btn);
        console.log('[Downloads] Button replaced with download link!');
      }
    });
  }

  function init(){
    console.log('[Downloads] init() called');
    const isLoggedIn = hasAccount();
    console.log('[Downloads] User logged in:', isLoggedIn);
    
    if(isLoggedIn){
      console.log('[Downloads] Enabling download...');
      enableDownload();
    } else {
      console.log('[Downloads] User not logged in, download remains disabled');
    }
  }

  // Run immediately
  init();
  
  // Run again after delays to catch late-rendered content
  setTimeout(init, 500);
  setTimeout(init, 1000);
  setTimeout(init, 1500);
  
  console.log('[Downloads] Setup complete');
})();

console.log('[Downloads] ========== SCRIPT END ==========');
