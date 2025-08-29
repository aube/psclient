/**
 * Устанавливает JWT cookie с расширенными настройками
 * @param {string} name - Название cookie
 * @param {string} value - value
 * @param {Object} options - Дополнительные опции
 * @param {number} options.expirationHours - Время жизни в часах
 * @param {string} options.domain - Домен
 * @param {string} options.path - Путь
 * @param {boolean} options.httpOnly - Защита от XSS
 * @param {'strict'|'lax'|'none'} options.sameSite - SameSite policy
 */
export const setCookie = (name, value, options = {}) => {
  const {
    expirationHours = 24,
    path = '/',
    domain = location.hostname,
    httpOnly = true,
    sameSite = 'lax',
    secure = location.protocol === 'https:'
  } = options;

  const maxAgeSeconds = expirationHours * 60 * 60;
  const expires = expirationHours ? new Date() : new Date(0);
  expires.setTime(expires.getTime() + maxAgeSeconds * 1000);

  let cookieString = `${name}=${encodeURIComponent(value)}; `;

  if (maxAgeSeconds) {
    cookieString += `max-age=${maxAgeSeconds}; `;
  }

  if (expires) {
    cookieString += `expires=${expires.toUTCString()}; `;
  }

  cookieString += `path=${path}; `;

  if (domain) {
    cookieString += `domain=${domain}; `;
  }

  if (secure) {
    cookieString += 'Secure; ';
  }

  cookieString += `SameSite=${sameSite}; `;

  if (httpOnly) {
    cookieString += 'HttpOnly; ';
  }

  document.cookie = cookieString;
}

/**
 * Читает cookie на бэке
 * @param {string} cookieName - Название cookie
 * @param {string} cookieHeader - req.headers.cookie
 * @returns {string} JWT токен или "" если не найдено
 */

export function readNodeCookie(cookieHeader, cookieName) {
  let cookieValue = "";
  
  if (!cookieHeader) return cookieValue;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      cookieValue = decodeURIComponent(value || '');
    }
  });
  
  return cookieValue;
}


// export function readFrontCookie(cookieName) {
//   return document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)')?.pop() || ''
// }