const SKIP_TYPES = ['submit', 'button', 'reset', 'image', 'file'];
const EMPTY_AS_NULL_TYPES = ['number', 'range', 'radio', 'date', 'datetime-local', 'month', 'week', 'time'];

function normalizeKey(name) {
  return name.replace(/\[\]$/, '');
}

function isEmpty(element) {
  const type = (element.type || '').toLowerCase();
  return EMPTY_AS_NULL_TYPES.includes(type) && element.value === '';
}

function emptyValue(element) {
  const type = (element.type || '').toLowerCase();
  if (type === 'checkbox') return false;
  if (EMPTY_AS_NULL_TYPES.includes(type)) return null;
  return '';
}

function coerceValue(element) {
  const type = (element.type || '').toLowerCase();
  const value = element.value;

  if ((type === 'number' || type === 'range') && value !== '') {
    return Number(value);
  }

  if (type === 'date' && value !== '') {
    return new Date(value + 'T00:00:00Z').toISOString();
  }

  if (type === 'datetime-local' && value !== '') {
    return new Date(value).toISOString();
  }

  return value;
}

export function buildFormPayload(form) {
  const groups = new Map();

  for (const element of form.elements) {
    if (!element.name || element.matches(':disabled')) continue;

    const type = (element.type || '').toLowerCase();
    if (SKIP_TYPES.includes(type)) continue;

    if (!groups.has(element.name)) {
      groups.set(element.name, []);
    }
    groups.get(element.name).push(element);
  }

  const payload = {};

  for (const [name, elements] of groups) {
    const key = normalizeKey(name);
    const isArray = /\[\]$/.test(name);
    const checkboxes = elements.filter((element) => element.type === 'checkbox');
    const radios = elements.filter((element) => element.type === 'radio');
    const multipleSelect = elements.find((element) => element.tagName === 'SELECT' && element.multiple);

    if (checkboxes.length) {
      if (isArray || checkboxes.length > 1) {
        payload[key] = checkboxes
          .filter((element) => element.checked)
          .map((element) => element.value);
      } else {
        payload[key] = checkboxes[0].checked;
      }
      continue;
    }

    if (radios.length) {
      const checked = radios
        .filter((element) => element.checked)
        .map((element) => element.value);

      payload[key] = isArray ? checked : (checked.length ? checked[0] : null);
      continue;
    }

    if (multipleSelect) {
      payload[key] = Array.from(multipleSelect.selectedOptions).map((option) => option.value);
      continue;
    }

    if (isArray || elements.length > 1) {
      payload[key] = elements.map((element) => (isEmpty(element) ? emptyValue(element) : coerceValue(element)));
      continue;
    }

    const element = elements[0];
    payload[key] = isEmpty(element) ? emptyValue(element) : coerceValue(element);
  }

  return payload;
}
