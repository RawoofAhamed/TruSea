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
      // Trim to last 10 digits if longer
      if (phoneNumber.length > 10) {
        phoneNumber = phoneNumber.slice(-10);
      }
      
      if (phoneNumber.length === 10) {
      const token = localStorage.getItem('OtpLoginToken');
      
      // If no token, we need to log in
      if (!token || token.trim() === '') {
        // 1. Trigger the login modal by clicking the account button
        const accountBtn = document.querySelector('.ts-icon-btn[aria-label="Account"], a[href="/account"]');
        
        if (accountBtn) {
          accountBtn.click();
          
          // 2. Wait for the modal to render and find the phone input
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds total (100ms intervals)
          
          const checkInput = setInterval(() => {
            // Target common selectors for phone inputs in these types of modals
            const phoneInput = document.querySelector('input[placeholder*="Phone"], input[placeholder*="phone"], input[name*="phone"], input[type="tel"]');
            
            if (phoneInput) {
              // Pre-fill the phone number
              phoneInput.value = phoneNumber;
              
              // Trigger events so reactive frameworks (React/Vue/etc) pick up the change
              phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
              phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Focus the input so the user can immediately edit or proceed
              phoneInput.focus();
              
              clearInterval(checkInput);
            }
            
            attempts++;
            if (attempts >= maxAttempts) {
              clearInterval(checkInput);
            }
          }, 100);
        }
      }
    }
  }

  // Run on load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initIdentityHelper();
  } else {
    window.addEventListener('DOMContentLoaded', initIdentityHelper);
  }
})();
