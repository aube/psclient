import { buildFormPayload } from '/static/formPayload.js';

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

function validateFiles(form) {
  const filesInputs = form.querySelectorAll('[type="file"]');
  const files = [];

  filesInputs.forEach(input => {
    files.push(...Array.from(input.files || []));
  });

  if (files.length === 0) return true;

  if (files.length > MAX_FILES) {
    return 'Можно прикрепить не более ' + MAX_FILES + ' файлов';
  }

  for (const f of files) {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (ALLOWED_EXTS.indexOf(ext) === -1) {
      return 'Недопустимый тип файла: ' + f.name;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return 'Файл слишком большой (максимум ' + MAX_FILE_SIZE_MB + ' МБ): ' + f.name;
    }
  }

  return true;
}

function hasSelectedFiles(form) {
  const filesInputs = form.querySelectorAll('input[type="file"]');

  for (const input of filesInputs) {
    if (input.files && input.files.length > 0) return true;
  }

  return false;
}

function notify(form, options, type, detail) {
  const callbacks = {
    success: options?.onSuccess,
    error: options?.onError,
    invalid: options?.onInvalid,
  };

  const callback = callbacks[type];
  if (typeof callback === 'function') {
    try {
      callback(detail);
    } catch (error) {
      console.error('Ошибка в обработчике ' + type + ': ' + error.message);
    }
  }

  form.dispatchEvent(new CustomEvent('form:' + type, { detail }));
}

export function sendForm(form, options = {}) {
  if (!form) {
    throw new Error('sendForm: form is required');
  }

  const ADDRESS = options.address || '/api/v1/interactions';
  const METHOD = options.method || 'POST';
  const USE_JSON = Boolean(options.json);
  const RESET = options.reset !== false;
  const CREDENTIALS = options.credentials || 'same-origin';

  if (String(METHOD).trim().toUpperCase() === 'GET') {
    throw new Error('sendForm: GET не поддерживается');
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (USE_JSON && hasSelectedFiles(form)) {
      notify(form, options, 'invalid', { errors: ['JSON-режим не поддерживает прикрепление файлов'] });
      return;
    }

    const validateFilesResult = validateFiles(form);
    if (validateFilesResult !== true) {
      console.error('Ошибка: ' + validateFilesResult);
      notify(form, options, 'invalid', { errors: [validateFilesResult] });
      return;
    }

    const validationErrors = (form.validations || [])
      .map(validationFn => validationFn())
      .filter(validationResult => typeof validationResult === 'string' && validationResult.trim() !== '');

    if (validationErrors.length) {
      console.error('Ошибки валидации: ' + validationErrors.join('; '));
      notify(form, options, 'invalid', { errors: validationErrors });
      return;
    }

    let response;

    try {
      const headers = { ...(options.headers || {}) };
      let body;

      if (USE_JSON) {
        const payload = typeof options.json === 'function' ? options.json(form) : buildFormPayload(form);
        if (form.dataset.form_name && payload && typeof payload === 'object' && !Array.isArray(payload)) {
          payload.type = payload.type || form.dataset.form_name;
        }
        body = JSON.stringify(payload);
        headers['Content-Type'] = 'application/json';
      } else {
        body = new FormData(form);
        if (form.dataset.form_name) {
          body.append('type', form.dataset.form_name);
        }
      }

      response = await fetch(ADDRESS, {
        method: METHOD,
        headers,
        body,
        credentials: CREDENTIALS
      });
    } catch (error) {
      console.error('Ошибка: ' + error.message);
      notify(form, options, 'error', { error });
      return;
    }

    if (response.ok) {
      if (RESET) form.reset();
      notify(form, options, 'success', { response });
    } else {
      console.error('Произошла ошибка при отправке');
      notify(form, options, 'error', { response });
    }
  });
}
