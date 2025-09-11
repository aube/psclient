/**
 * Читает cookie на бэке
 * @param cookieHeader - req.headers.cookie
 * @param cookieName - Название cookie
 * @returns JWT токен или "" если не найдено
 */
export function readNodeCookie(cookieHeader: string, cookieName: string): string;

/**
 * Устанавливает JWT cookie с расширенными настройками
 * @param name - Название cookie
 * @param value - value
 * @param options - Дополнительные опции
 * @param options.expirationHours - Время жизни в часах
 * @param options.domain - Домен
 * @param options.path - Путь
 * @param options.httpOnly - Защита от XSS
 * @param options.sameSite - SameSite policy
 */
export const setCookie: (
  name: string,
  value: string,
  options?: {
    expirationHours?: number;
    path?: string;
    domain?: string;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    secure?: boolean;
  }
) => void;