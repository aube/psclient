const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

export function readFrontCookie(cookieName: string) {
  if (isBrowser)
    return document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)')?.pop() || ''
  else
    return ''
}
