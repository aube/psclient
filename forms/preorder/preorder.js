document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form-preorder');
  if (!form) return;

  const privacyConsent = form.querySelector('[name="privacy_consent"]');
  const personalDataConsent = form.querySelector('[name="personal_data_consent"]');
  const consentError = document.getElementById('consent-error');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!privacyConsent.checked || !personalDataConsent.checked) {
      consentError.classList.remove('hidden');
      return;
    }
    consentError.classList.add('hidden');

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/v1/interactions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        form.reset();
      } else {
        console.error('Ошибка при отправке формы');
      }
    } catch (error) {
      console.error('Ошибка: ' + error.message);
    }
  });
});
