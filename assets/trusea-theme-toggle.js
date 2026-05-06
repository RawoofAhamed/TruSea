/* =====================================================
   TruSea Theme Toggle
   - Defaults to dark theme on first visit
   - Persists preference in localStorage
   - Applies data-theme on <html> before paint (see
     the inline script in theme.liquid <head>)
   ===================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'ts-theme';
  const DARK        = 'dark';
  const LIGHT       = 'light';
  const DEFAULT     = DARK; // dark is the brand default

  /**
   * Get stored preference, or return brand default.
   */
  function getPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  }

  /**
   * Apply theme to <html> element.
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Save preference and apply theme.
   */
  function setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    applyTheme(theme);
    updateToggleButton(theme);
  }

  /**
   * Update the toggle button's aria-label and icon.
   */
  function updateToggleButton(theme) {
    const btn = document.getElementById('ts-theme-toggle');
    if (!btn) return;

    if (theme === DARK) {
      // Currently dark — clicking will go light, so show sun icon
      btn.setAttribute('aria-label', 'Switch to light mode');
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>`;
    } else {
      // Currently light — clicking will go dark, so show moon icon
      btn.setAttribute('aria-label', 'Switch to dark mode');
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>`;
    }
  }

  /**
   * Toggle between dark and light.
   */
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || DEFAULT;
    setTheme(current === DARK ? LIGHT : DARK);
  }

  /* ---- Init on DOM ready ---- */
  function init() {
    // Apply on load (also done inline in <head> for no-flash)
    const theme = getPreference();
    applyTheme(theme);

    // Wire up button
    const btn = document.getElementById('ts-theme-toggle');
    if (btn) {
      updateToggleButton(theme);
      btn.addEventListener('click', toggleTheme);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
