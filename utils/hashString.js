import crypto from 'crypto';

export function hashString(str, length = 8) {
  const hash = crypto.createHash('sha256')
    .update(str)
    .digest('base64')
    .replace(/[+/=]/g, '') // удаляем небезопасные для имени файла символы
    .slice(0, length);
  
  return hash;
}