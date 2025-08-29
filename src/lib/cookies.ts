export function readFrontCookie(cookieName: string) {
  return document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)')?.pop() || ''
}