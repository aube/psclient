
// Cookie consent banner
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}

export function showCookieBanner() {
  if (getCookie('cookie_accepted') === 'true') return;
  if (window.__SITE_SETTINGS.supressCookieBanner) return;

  const banner = document.createElement('div');
  banner.className = [
    'inverted', 'card', 'p-4 px-6', 'm-4', 'gap-4', 'shadow-elevated',
    'fixed', 'bottom-4',  'z-50', 'left-1/2',
  '-translate-x-1/2',
    'items-center', 'justify-between', 'md:-translate-x-1/2', 'break-words',
  ].join(' ');
  banner.style.maxWidth = '640px';
  banner.style.minWidth = '383px';

  const bannerText = window.__SITE_SETTINGS.cookieBannerText || `Продолжая работу с сайтом, вы соглашаетесь на использование файлов cookie в соответствии с [<a href="/policy" style="text-decoration:underline">Политикой конфиденциальности</a>].`
  const bannerBtn = window.__SITE_SETTINGS.cookieBannerBtn || `Хорошо`

  let bannerTemplate = window.__SITE_SETTINGS.cookieBannerTemplate

  if (!bannerTemplate) {
    bannerTemplate = `${bannerText}
    <div class="text-right"><button class="btn-primary mt-4" style="background-color: var(--color-surface-main);">${bannerBtn}</button></div>
    `    
  }

  banner.innerHTML = bannerTemplate

  document.body.appendChild(banner);

  banner.querySelector('button').addEventListener('click', () => {
    setCookie('cookie_accepted', 'true', 365);
    banner.remove();
  });
}