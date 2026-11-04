import { PJAXClient } from "/static/pjax.js"
import { initAltcha } from "/static/altcha.js"
import { sendForm } from "/static/sendForm.js"
import { toast, showToast, useToast } from "/static/toast.js"
import { chat } from "/static/chat.js"
import { initChatNotifications } from "/static/chatNotifications.js"

window.initInvisibleAltchaForm = initAltcha('/api/v1/altcha/challenge');
window.sendForm = sendForm;
window.toast = toast;
window.showToast = showToast;
window.useToast = useToast;
window.chat = chat;

initChatNotifications();
chat.API.start().catch(() => {});

// Auto-initialize if the script is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Allow customization via data attributes on the script tag or global config
  const config = window.PJAX_CONFIG || {};
  
  // Create the PJAX client instance
  window.PJAX = new PJAXClient(config);
});

// Handle page reload events from hot reload
window.addEventListener('beforeunload', () => {
  chat.API.stop();
  if (window.PJAX && typeof window.PJAX.destroy === 'function') {
    window.PJAX.destroy();
  }
});

// Export for module systems (if applicable)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PJAXClient;
}

