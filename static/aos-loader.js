(function() {
  // 1. Проверяем userAgent на наличие роботов
  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
  // Проверяем, не просил ли пользователь минимизировать анимации в настройках ОС
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Если это бот или включен режим уменьшения движения — ничего не делаем.
  // Контент останется полностью видимым.
  if (isBot || prefersReducedMotion) return;

  const aosCssUrl = '/static/aos.css';
  const aosJsUrl = '/static/aos.js';

  // 2. Динамически создаем и подключаем CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = aosCssUrl;
  document.head.appendChild(link);

  // 3. Ждем, пока CSS применится, чтобы избежать резкого "мигания" контента
  link.onload = function() {
    // 4. Динамически загружаем JS-скрипт AOS
    const script = document.createElement('script');
    script.src = aosJsUrl;
    script.async = true;
    document.body.appendChild(script);

    // 5. После загрузки скрипта инициализируем AOS
    script.onload = function() {
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 800, // ваши настройки AOS
          once: true     // анимировать только один раз при первом появлении
        });
      }
    };
  };
})();
