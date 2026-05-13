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

// Отправка данных формы в /interactions
document.addEventListener('DOMContentLoaded', function() {

  function bindFormListener(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Собираем данные
      const formData = new FormData(form);
      
      try {
        const response = await fetch('/api/v1/interactions', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          console.log('Форма успешно отправлена!');
          form.reset();
        } else {
          console.error('Произошла ошибка при отправке');
        }
      } catch (error) {
        console.error('Ошибка: ' + error.message);
      }
    });
  }

  const forms = document.querySelectorAll('.form');

  [...forms].forEach(form => bindFormListener(form))  
});