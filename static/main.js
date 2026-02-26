import { PJAXClient } from "/static/pjax.js"

// Auto-initialize if the script is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Allow customization via data attributes on the script tag or global config
  const config = window.PJAX_CONFIG || {};
  
  // Create the PJAX client instance
  window.PJAX = new PJAXClient(config);
});

// Handle page reload events from hot reload
window.addEventListener('beforeunload', () => {
  if (window.PJAX && typeof window.PJAX.destroy === 'function') {
    window.PJAX.destroy();
  }
});

// Export for module systems (if applicable)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PJAXClient;
}