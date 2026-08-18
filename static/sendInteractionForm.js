const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
  
function validateFiles() {
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
      if (f.size > MAX_FILE_SIZE) {
        return 'Файл слишком большой (максимум 10 МБ): ' + f.name;
      }
    }

    return true;
}

export function sendInteractionForm() {

  function bindFormListener(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

    const validateFilesResult = validateFiles()
      if (validateFilesResult !== true) {
        console.error('Ошибка: ' + validateFilesResult);
      }
      
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
}