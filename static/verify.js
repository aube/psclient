const STATUS_MESSAGES = {
  missing: 'Ссылка подтверждения недействительна.',
  error: 'Не удалось подтвердить e-mail. Ссылка могла устареть.',
};

function setStatus(message) {
  const status = document.getElementById('verify-status');
  if (status) {
    status.textContent = message;
  }
}

async function verifyEmail() {
  const token = new URLSearchParams(window.location.search).get('token');

  if (!token) {
    setStatus(STATUS_MESSAGES.missing);
    return;
  }

  try {
    const { client } = await import(window.ASSETS.client);

    await client.verifyEmail(token);

    window.location.replace('/profile');
    return;
  } catch (error) {
    console.error('Email verification error:', error);
  }

  setStatus(STATUS_MESSAGES.error);
}

let started = false;

function start() {
  if (started) return;
  started = true;
  verifyEmail();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
