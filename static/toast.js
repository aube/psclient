const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'center',
];

const SEVERITIES = ['success', 'info', 'warn', 'error', 'secondary', 'contrast'];

const ICONS = {
  success: '/static/icons/regular/check-circle.svg',
  info: '/static/icons/regular/info.svg',
  warn: '/static/icons/regular/warning-circle.svg',
  error: '/static/icons/regular/x-circle.svg',
  secondary: '/static/icons/regular/info.svg',
  contrast: '/static/icons/regular/info.svg',
};

const DEFAULTS = {
  position: 'top-right',
  life: 10000,
  max: 0,
};

const containers = new Map();
const entries = new Map();
const config = { ...DEFAULTS };

let sequence = 0;

function readSiteSettings() {
  if (typeof window === 'undefined') return;

  const settings = window.__SITE_SETTINGS || {};

  if (POSITIONS.includes(settings.toastPosition)) {
    config.position = settings.toastPosition;
  }

  if (settings.toastLife !== undefined && Number.isFinite(Number(settings.toastLife))) {
    config.life = Number(settings.toastLife);
  }
}

function getContainer(position) {
  let container = containers.get(position);

  if (container && container.isConnected) {
    return container;
  }

  container = document.createElement('div');
  container.className = 'toast-container toast-container-' + position;
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  containers.set(position, container);

  return container;
}

function normalize(message) {
  const severity = String(message.severity || '').toLowerCase();
  const position = String(message.position || '').toLowerCase();
  const life = message.life === undefined || message.life === null
    ? config.life
    : Number(message.life);

  return {
    ...message,
    severity: SEVERITIES.includes(severity) ? severity : 'info',
    position: POSITIONS.includes(position) ? position : config.position,
    life: Number.isFinite(life) ? life : config.life,
    closable: message.closable !== false,
    group: message.group === undefined ? null : message.group,
  };
}

function buildMessage(entry) {
  const { message } = entry;

  const element = document.createElement('div');
  element.className = 'toast-message toast-severity-' + message.severity;
  element.dataset.toastId = entry.id;

  const icon = document.createElement('span');
  icon.className = 'icon toast-icon';
  icon.style.setProperty('--icon-url', 'url("' + ICONS[message.severity] + '")');
  icon.setAttribute('aria-hidden', 'true');
  element.appendChild(icon);

  const content = document.createElement('div');
  content.className = 'toast-content';

  if (message.summary) {
    const summary = document.createElement('div');
    summary.className = 'toast-summary';
    summary.textContent = message.summary;
    content.appendChild(summary);
  }

  if (message.detail) {
    const detail = document.createElement('div');
    detail.className = 'toast-detail';
    detail.textContent = message.detail;
    content.appendChild(detail);
  }

  element.appendChild(content);

  if (message.closable) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', message.closeLabel || 'Закрыть уведомление');
    close.textContent = '×';
    close.addEventListener('click', () => remove(entry.id));
    element.appendChild(close);
  }

  return element;
}

function enforceMax(position) {
  if (config.max <= 0) return;

  const inPosition = [...entries.values()].filter(entry => entry.message.position === position);

  while (inPosition.length > config.max) {
    remove(inPosition.shift().id);
  }
}

function add(message = {}) {
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () => add(message), { once: true });
    return null;
  }

  const normalized = normalize(message);
  const id = normalized.id === undefined || normalized.id === null
    ? 'toast-' + (++sequence)
    : String(normalized.id);

  if (entries.has(id)) {
    remove(id);
  }

  const entry = {
    id,
    original: message,
    message: normalized,
    element: null,
    timer: null,
    group: normalized.group,
  };

  entries.set(id, entry);

  const container = getContainer(normalized.position);
  const element = buildMessage(entry);
  entry.element = element;
  container.appendChild(element);

  requestAnimationFrame(() => element.classList.add('toast-visible'));

  enforceMax(normalized.position);

  if (normalized.life > 0) {
    entry.timer = setTimeout(() => remove(id), normalized.life);
  }

  return id;
}

function resolveEntry(target) {
  if (target === undefined || target === null) return null;

  if (typeof target === 'string' || typeof target === 'number') {
    return entries.get(String(target)) || null;
  }

  if (typeof target === 'object') {
    if (target.id !== undefined && target.id !== null && entries.has(String(target.id))) {
      return entries.get(String(target.id));
    }

    for (const entry of entries.values()) {
      if (entry.original === target) return entry;
    }
  }

  return null;
}

function remove(target) {
  const entry = resolveEntry(target);

  if (!entry) return false;

  if (entry.timer) {
    clearTimeout(entry.timer);
  }

  entries.delete(entry.id);

  const element = entry.element;

  if (!element || !element.isConnected) {
    return true;
  }

  element.classList.remove('toast-visible');
  element.classList.add('toast-leaving');

  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    element.remove();
  };

  element.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, 300);

  return true;
}

function removeGroup(group) {
  if (group === undefined || group === null) return;

  for (const entry of [...entries.values()]) {
    if (entry.group === group) {
      remove(entry.id);
    }
  }
}

function removeAllGroups() {
  for (const entry of [...entries.values()]) {
    if (entry.group !== undefined && entry.group !== null) {
      remove(entry.id);
    }
  }
}

function clear() {
  for (const entry of [...entries.values()]) {
    remove(entry.id);
  }
}

function configure(options = {}) {
  if (POSITIONS.includes(options.position)) {
    config.position = options.position;
  }

  if (options.life !== undefined && Number.isFinite(Number(options.life))) {
    config.life = Number(options.life);
  }

  if (options.max !== undefined && Number.isFinite(Number(options.max))) {
    config.max = Math.max(0, Number(options.max));
  }

  return { ...config };
}

function showToast(summary, detail, severity, options = {}) {
  if (summary && typeof summary === 'object') {
    return add(summary);
  }

  return add({
    ...options,
    summary,
    detail,
    severity: severity || options.severity || 'info',
  });
}

function useToast() {
  return toast;
}

readSiteSettings();

export const toast = {
  add,
  remove,
  removeGroup,
  removeAllGroups,
  clear,
  configure,
  positions: POSITIONS,
  severities: SEVERITIES,
};

export { showToast, useToast };
