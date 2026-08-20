const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;
  
function validateFiles(form) {
    const filesInput = form.querySelector('[type="file"]');

    if (!filesInput || filesInput.files.length === 0) return true;

    const files = Array.from(filesInput.files);

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

export function sendInteractionForm() {

  function bindFormListener(form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const validateFilesResult = validateFiles(form)
        if (validateFilesResult !== true) {
            console.error('Ошибка: ' + validateFilesResult);
            return
        }

        const validationErrors = (form.validations || []).map(validationFn => {
            return validationFn()
        }).filter(validationResult => validationResult > "")

        if (validationErrors.length) {
            console.error('Ошибки валидации: ' + validationErrors.join('; '));
            return
        }

        // Собираем данные
        const formData = new FormData(form);
        if (form.dataset.form_name) {
            formData.append('type', form.dataset.form_name)
        }
        
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
        }
    );
  }

  const forms = document.querySelectorAll('form');
  [...forms].forEach(form => bindFormListener(form))  
}