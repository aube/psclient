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

function notify(form, options, type, detail) {
  const callbacks = {
    success: options?.onSuccess,
    error: options?.onError,
    invalid: options?.onInvalid,
  };

  const callback = callbacks[type];
  if (typeof callback === 'function') {
    callback(detail);
  }

  form.dispatchEvent(new CustomEvent('form:' + type, { detail }));
}

export function sendForm(form, options) {
  if (!form) {
    throw new Error('sendForm: form is required');
  }

  const ADDRESS = options?.address || '/api/v1/interactions';
  const METHOD = (options?.method || 'POST').toUpperCase();

  if (METHOD === 'GET') {
    throw new Error('sendForm: GET is not supported');
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

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

    const formData = new FormData(form);
    if (form.dataset.form_name) {
      formData.append('type', form.dataset.form_name);
    }

    try {
      const response = await fetch(ADDRESS, {
        method: METHOD,
        body: formData
      });

      if (response.ok) {
        form.reset();
        notify(form, options, 'success', { response });
      } else {
        console.error('Произошла ошибка при отправке');
        notify(form, options, 'error', { response });
      }
    } catch (error) {
      console.error('Ошибка: ' + error.message);
      notify(form, options, 'error', { error });
    }
  });
}
