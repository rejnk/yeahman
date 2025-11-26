// Download script - ENABLE FOR EVERYONE
console.log('[Downloads] ========== ENABLING DOWNLOADS FOR ALL ==========');

(function(){
  function enableDownload(){
    console.log('[Downloads] Looking for download buttons...');
    
    // Find ALL disabled buttons/elements
    const allElements = document.querySelectorAll('button, a, div, span');
    let fixed = 0;
    
    allElements.forEach(function(el){
      const title = el.getAttribute('title') || '';
      const text = el.textContent || '';
      
      // If it mentions "register" or "enable downloads", fix it
      if(title.includes('register') || title.includes('Please register') || text.includes('Please register')){
        console.log('[Downloads] FOUND DISABLED BUTTON - FIXING IT');
        
        // Create download link
        const link = document.createElement('a');
        link.href = './assets/FlowusDesktop.exe';
        link.download = 'FlowusDesktop.exe';
        link.textContent = 'Download';
        link.className = 'h-10 rounded bg-black text-white';
        link.style.cssText = 'padding: 10px 14px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; cursor: pointer; display: inline-block;';
        
        el.parentNode.replaceChild(link, el);
        fixed++;
        console.log('[Downloads] FIXED! Replaced with download link');
      }
    });
    
    console.log('[Downloads] Fixed', fixed, 'buttons');
  }

  // Run immediately
  enableDownload();
  
  // Run multiple times to catch React rendering
  setTimeout(enableDownload, 100);
  setTimeout(enableDownload, 300);
  setTimeout(enableDownload, 600);
  setTimeout(enableDownload, 1000);
  setTimeout(enableDownload, 1500);
  setTimeout(enableDownload, 2000);
  
  console.log('[Downloads] ========== SETUP COMPLETE ==========');
})();
