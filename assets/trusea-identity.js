/**
 * TruSea Identity Helper
 * Handles auto-opening login modal and pre-filling phone number from URL query 'q'
 * if the user is not already logged in (OtpLoginToken missing).
 */
(function() {
  function initIdentityHelper() {
    const urlParams = new URLSearchParams(window.location.search);
    let phoneNumber = urlParams.get('q');
    
    if (phoneNumber) {
      // 1. Trim to last 10 digits if longer
      if (phoneNumber.length > 10) {
        phoneNumber = phoneNumber.slice(-10);
      }
      
      if (phoneNumber.length === 10) {
        const token = localStorage.getItem('OtpLoginToken');
        
        // 2. If no token, we need to log in
        if (!token || token.trim() === '' || token === 'null') {
          // Find the login/account button. Trying multiple selectors.
          const selectors = [
            '.ts-icon-btn[aria-label="Account"]',
            'a[href="/account"]',
            '.login-btn',
            '.account-link',
            '[data-open-login]'
          ];
          
          let accountBtn = null;
          for (let s of selectors) {
            accountBtn = document.querySelector(s);
            if (accountBtn) break;
          }
          
          if (accountBtn) {
            console.log('TruSea Identity: Triggering login modal for phone:', phoneNumber);
            
            // Programmatically click with a MouseEvent to ensure listeners are triggered
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            accountBtn.dispatchEvent(clickEvent);
            
            // 3. Wait for the modal to render and find the phone input
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds total
            
            const checkInput = setInterval(() => {
              const phoneInput = document.querySelector('input[placeholder*="Phone"], input[placeholder*="phone"], input[name*="phone"], input[type="tel"], .otp-phone-input');
              
              if (phoneInput && phoneInput.offsetParent !== null) { // Ensure it's visible
                phoneInput.value = phoneNumber;
                
                // Trigger events for reactive frameworks
                phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                // 4. Populate and Focus
                phoneInput.value = phoneNumber;
                phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Aggressive focus strategy
                const focusSequence = [0, 50, 150, 300, 500];
                focusSequence.forEach(delay => {
                  setTimeout(() => {
                    if (document.activeElement !== phoneInput) {
                      phoneInput.click();
                      phoneInput.focus();
                      if (typeof phoneInput.select === 'function') phoneInput.select();
                    }
                  }, delay);
                });

                clearInterval(checkInput);
                console.log('TruSea Identity: Phone populated and focus sequence initiated.');
              }
              
              attempts++;
              if (attempts >= maxAttempts) {
                clearInterval(checkInput);
                console.log('TruSea Identity: Could not find phone input after 10s.');
              }
            }, 100);
          } else {
            console.log('TruSea Identity: Account button not found.');
          }
        }
      }
    }
  }

  // Run on load and also try after a short delay
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initIdentityHelper();
  } else {
    window.addEventListener('DOMContentLoaded', initIdentityHelper);
  }
  // Delayed check for cases where buttons render late
  setTimeout(initIdentityHelper, 1000);
})();
