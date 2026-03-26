export const TW_DEFAULT_THEME = () => ({
  colors: {
    // Светлая тема с синим акцентом
    surface: {
      main: "#f8fafc", // Фон страницы (слегка голубоватый)
      card: "#ffffff", // Фон карточек
      contrast: "#0ea5e9", // Акцент для бейджей (sky-500)
    },
    content: {
      primary: "#0f172a", // Заголовки (slate-900)
      secondary: "#64748b", // Текст (slate-500)
      inverted: "#ffffff", // Текст на акценте
    },
    border: {
      subtle: "#e2e8f0", // Границы (slate-200)
      focus: "#38bdf8", // Фокус (sky-400)
    },
    action: {
      primary: "#0ea5e9", // Кнопки (sky-500)
      primaryHover: "#0284c7", // Ховер (sky-600)
      secondary: "#ffffff",
    },
  },

  // borderRadius: {
  //   ...baseConfig.theme.extend.borderRadius,
  //   action: '0.375rem', // Более острые кнопки
  // },
})



export const TW_BASE_THEME = () => ({
  extend: {
    // ============================================
    // 1. ИСХОДНАЯ ПАЛИТРА (источник истины)
    // ============================================
    colors: {
      primary: {
        DEFAULT: '#6366f1',
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
        950: '#1e1b4b',
      },
      secondary: {
        DEFAULT: '#22c55e',
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      accent: {
        DEFAULT: '#ff6b5c',
        50: '#fff1f0',
        100: '#ffe4e2',
        200: '#ffc9c4',
        300: '#ffaea6',
        400: '#ff9288',
        500: '#ff6b5c',
        600: '#e55a4b',
        700: '#cc4a3c',
        800: '#b23b2e',
        900: '#992c20',
      },
      brand: {
        dark: '#111827',
        light: '#f9fafb',
      },

      // ============================================
      // 2. СЕМАНТИЧЕСКИЕ ТОКЕНЫ (для компонентов)
      // ============================================
      // Переопределяйте эти значения в конфиге сайта,
      // а не исходную палитру выше
      surface: {
        main: '#f9fafb',      // bg-surface-main
        card: '#ffffff',      // bg-surface-card
        contrast: '#4f46e5',  // bg-surface-contrast (акцентные плашки)
      },
      content: {
        primary: '#111827',   // text-content-primary (заголовки)
        secondary: '#4b5563', // text-content-secondary (описания)
        inverted: '#ffffff',  // text-content-inverted (текст на тёмном/акценте)
      },
      border: {
        subtle: '#e5e7eb',    // border-border-subtle
        focus: '#818cf8',     // border-border-focus
      },
      action: {
        primary: '#4f46e5',       // bg-action-primary (кнопки)
        primaryHover: '#4338ca',  // hover:bg-action-primaryHover
        secondary: '#ffffff',     // bg-action-secondary
      },
      transparent: 'transparent',
    },

    // ============================================
    // 3. ШРИФТЫ
    // ============================================
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      heading: ['Inter', 'system-ui', 'sans-serif'],
    },

    // ============================================
    // 4. КОНТЕЙНЕР
    // ============================================
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },

    // ============================================
    // 5. ОТСТУПЫ (спейсинг)
    // ============================================
    spacing: {
      '18': '4.5rem',
      '88': '22rem',
      '128': '32rem',
      '144': '36rem',
    },

    // ============================================
    // 6. СКРУГЛЕНИЯ
    // ============================================
    borderRadius: {
      'xl': '1rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      'action': '0.5rem', // Для кнопок и инпутов
    },

    // ============================================
    // 7. ТЕНИ
    // ============================================
    boxShadow: {
      'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      'card': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
      'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
      'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    },

    // ============================================
    // 8. АНИМАЦИИ
    // ============================================
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'slide-down': 'slideDown 0.3s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
  },
})

export const TW_CLASSES_SAFELIST = () => ([
  'bg-surface-main', 'bg-surface-card', 'bg-surface-contrast',
  'text-content-primary', 'text-content-secondary', 'text-content-inverted',
  'border-border-subtle', 'border-border-focus',
  'bg-action-primary', 'hover:bg-action-primaryHover',
  'border-transparent',
  'focus:border-transparent',
  'border-secondary',
  'border-border-secondary',
  'bg-secondary/10',
  'text-secondary',
])


export const TW_BASE_CSS = () => (`@tailwind base;
@tailwind components;
@tailwind utilities;


/* ============================================
   БАЗОВЫЕ КОМПОНЕНТЫ
   ============================================ */
@layer components {
  /* ============================================
     ХЕДЕР
     ============================================ */
  .header {
    @apply bg-surface-card/95 backdrop-blur-sm shadow-soft border-b border-border-subtle;
  }
  
  .logo {
    @apply text-content-primary hover:text-action-primary transition-colors;
  }
  
  /* Навигация десктоп */
  .nav-link {
    @apply relative text-content-secondary hover:text-action-primary font-medium;
    @apply transition-colors;
  }
  
  /* Подчёркивание при наведении (семантический акцент) */
  .nav-link::after {
    content: '';
    @apply absolute left-0 bottom-[-4px] h-0.5 w-0 bg-action-primary;
  }
  .nav-link:hover::after {
    @apply w-full;
  }
  
  /* ============================================
     МОБИЛЬНОЕ МЕНЮ
     ============================================ */
  .mobile-menu2 {
    @apply transition-transform duration-300 ease-in-out;
    @apply transform -translate-x-full opacity-0 invisible;
    @apply h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)];
  }
  
  .mobile-menu {
    height: calc(100vh - 4rem);
    @apply transition-transform duration-300 ease-in-out;
    @apply transform -translate-x-full opacity-0 invisible;
    @apply fixed inset-0 top-16 left-0 w-full bg-surface-card shadow-elevated z-40 overflow-y-auto;
  }

  .mobile-menu.open {
    @apply transform translate-x-0 opacity-100 visible;
  }
  
  .mobile-nav-link {
    @apply transition-all duration-200;
  }
  
  .mobile-nav-link:hover {
    @apply bg-surface-contrast/10 pl-5;
  }
  
  /* Блокировка скролла при открытом меню */
  body.menu-open {
    @apply overflow-hidden;
  }
}



@layer components {
  /* ============================================
     HERO SECTION
     ============================================ */
  .hero {
    @apply py-18 lg:py-24;
    @apply bg-surface-main;
  }
  
  .hero-content {
    @apply animate-fade-in;
  }
  
  /* Плавающие карточки (анимация) */
  .card-float {
    @apply animate-slide-up;
    animation-delay: 0.2s;
    animation-fill-mode: both;
  }
  
  .card-float-2 {
    @apply animate-slide-up;
    animation-delay: 0.4s;
    animation-fill-mode: both;
  }
  
  /* ============================================
     КНОПКИ (базовые стили)
     ============================================ */
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2;
    @apply px-6 py-3 rounded-action font-semibold;
    @apply bg-action-primary text-content-inverted;
    @apply hover:bg-action-primaryHover transition-colors duration-200;
    @apply shadow-soft hover:shadow-elevated;
  }
  
  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2;
    @apply px-6 py-3 rounded-action font-semibold;
    @apply bg-surface-card text-content-primary;
    @apply border border-border-subtle hover:border-action-primary;
    @apply transition-all duration-200;
  }

  .section {
    @apply py-18 lg:py-24;
  }
}


@layer components { 
  /* Базовый класс карточки */
  .card {
    @apply bg-surface-card rounded-2xl shadow-card p-6;
    @apply border border-border-subtle/50;
    @apply hover:shadow-card-hover transition-all duration-300;
  }

  /* Сетка для карточек (адаптивная) */
  .card-grid {
    @apply grid gap-6;
    @apply sm:grid-cols-2;
    @apply lg:grid-cols-3;
    @apply xl:grid-cols-4;
  }

  /* Карточка участника команды */
  .card-team {
    @apply bg-surface-card rounded-2xl overflow-hidden shadow-card;
    @apply border border-border-subtle/50;
    @apply hover:shadow-elevated transition-all duration-300;
    @apply flex flex-col;
  }
  
  /* Эффект при наведении на фото */
  .card-team .aspect-\[4_3\] img {
    @apply transition-transform duration-300;
  }
  .card-team:hover .aspect-\[4_3\] img {
    @apply scale-105;
  }
}


@layer components {
  /* ============================================
     PRICING SECTION
     ============================================ */
  .pricing {
    @apply py-18 lg:py-24;
    @apply bg-surface-main;
  }
  
  /* Карточка тарифа */
  .card-pricing {
    @apply relative bg-surface-card rounded-2xl shadow-card;
    @apply border border-border-subtle;
    @apply hover:shadow-elevated transition-all duration-300;
    @apply flex flex-col;
  }
  
  /* Выделенный (популярный) тариф */
  .card-pricing-popular {
    @apply border-2 border-action-primary shadow-elevated;
    @apply scale-105 z-10;
  }
  
  @media (max-width: 767px) {
    .card-pricing-popular {
      @apply scale-100;
    }
  }
  
  /* Кнопки тарифов */
  .btn-pricing-basic {
    @apply px-6 py-3 rounded-action font-semibold;
    @apply bg-surface-card text-content-primary;
    @apply border border-border-subtle hover:border-action-primary;
    @apply transition-all duration-200;
  }
  
  .btn-pricing-pro {
    @apply px-6 py-3 rounded-action font-semibold;
    @apply bg-action-primary text-content-inverted;
    @apply hover:bg-action-primaryHover transition-colors duration-200;
    @apply shadow-soft hover:shadow-elevated;
  }
  
  /* FAQ Accordion */
  details > summary {
    @apply list-none;
  }
  details > summary::-webkit-details-marker {
    display: none;
  }


  /* ============================================
     CONTACT SECTION
     ============================================ */
  .contact {
    @apply py-18 lg:py-24;
    @apply bg-surface-main;
  }
  
  .contact-form-wrapper {
    @apply bg-surface-card rounded-2xl shadow-card p-6 lg:p-8;
    @apply border border-border-subtle;
  }
  
  /* Соц. ссылки */
  .social-link {
    @apply w-10 h-10 rounded-xl bg-surface-card border border-border-subtle;
    @apply flex items-center justify-center text-content-secondary;
    @apply hover:text-action-primary hover:border-action-primary;
    @apply transition-all duration-200;
  }
}

@layer components {
  /* ============================================
     FORM ELEMENTS
     ============================================ */
  .form-group {
    @apply mb-5;
  }
  
  .form-label {
    @apply block text-content-primary font-medium text-sm mb-2;
  }
  
  .form-input {
    @apply w-full px-4 py-3 rounded-action;
    @apply bg-surface-main border border-border-subtle;
    @apply text-content-primary text-base;
    @apply placeholder:text-content-secondary/50;
    @apply focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent;
    @apply transition-all duration-200;
  }
  
  .form-input.error {
    @apply border-accent-500 focus:ring-accent-500/20;
  }
  
  textarea.form-input {
    @apply resize-y min-h-[120px];
  }
  
  select.form-input {
    @apply cursor-pointer appearance-none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }
  
  /* Сообщения об ошибках */
  .form-error {
    @apply mt-2 text-sm text-accent-500 flex items-center;
  }
  
  /* Сообщение об успехе */
  .form-success {
    @apply p-4 rounded-xl bg-secondary/10 border border-secondary/20;
  }

  .form-input.success {
    @apply border-secondary focus:ring-secondary/20;
  }
  /* ============================================
     CHECKBOX (кастомный)
     ============================================ */
  .form-checkbox {
    @apply mt-6;
  }
  
  .checkbox-label {
    @apply flex items-start gap-3 cursor-pointer;
  }
  
  .checkbox-input {
    @apply sr-only;
  }
  
  .checkbox-custom {
    @apply w-5 h-5 rounded flex-shrink-0;
    @apply bg-surface-main border border-border-subtle;
    @apply transition-all duration-200;
    @apply flex items-center justify-center;
  }
  
  .checkbox-input:checked + .checkbox-custom {
    @apply bg-action-primary border-action-primary;
  }
  
  .checkbox-input:checked + .checkbox-custom::after {
    content: '';
    @apply w-3 h-3;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
  
  .checkbox-input:focus + .checkbox-custom {
    @apply ring-2 ring-border-focus;
  }
  
  .checkbox-text {
    @apply leading-tight;
  }
  
  /* ============================================
     КНОПКА ОТПРАВКИ
     ============================================ */
  .btn-submit {
    @apply inline-flex items-center justify-center gap-2;
    @apply w-full px-6 py-4 rounded-action font-semibold text-base;
    @apply bg-action-primary text-content-inverted;
    @apply hover:bg-action-primaryHover transition-colors duration-200;
    @apply shadow-soft hover:shadow-elevated;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
  }


}


@layer components {
  /* ============================================
     FOOTER
     ============================================ */
  .footer {
    @apply bg-surface-main border-t border-border-subtle;
  }
  
  /* Логотип */
  .footer-logo {
    @apply text-content-primary hover:text-action-primary transition-colors;
  }
  
  /* Заголовки колонок */
  .footer-heading {
    @apply text-content-primary font-semibold text-sm uppercase tracking-wider mb-4;
  }
  
  /* Ссылки в колонках */
  .footer-link {
    @apply text-content-secondary hover:text-action-primary text-sm;
    @apply transition-colors duration-200;
    @apply inline-block;
  }
  
  .footer-link:hover {
    @apply translate-x-0.5;
  }
  
  /* Ссылки в контактах (инлайн) */
  .footer-link-inline {
    @apply text-content-secondary hover:text-action-primary text-sm;
    @apply transition-colors duration-200;
  }
  
  /* Соц. иконки */
  .footer-social {
    @apply w-10 h-10 rounded-xl bg-surface-card border border-border-subtle;
    @apply flex items-center justify-center text-content-secondary;
    @apply hover:text-action-primary hover:border-action-primary hover:bg-surface-contrast/10;
    @apply transition-all duration-200;
  }
  
  /* Ссылки в нижнем баре */
  .footer-link-legal {
    @apply text-content-secondary/80 hover:text-content-primary text-xs;
    @apply transition-colors duration-200;
  }
  
  /* Адаптив для мобильного */
  @media (max-width: 767px) {
    .footer-nav {
      @apply border-t border-border-subtle pt-6 mt-2;
    }
    .footer-nav:first-of-type {
      @apply border-t-0 pt-0 mt-0;
    }
  }
}

@layer components {
  /* ============================================
     GALLERY SECTION
     ============================================ */
  .gallery {
    @apply py-18 lg:py-24;
    @apply bg-surface-main;
  }
  
  /* Обёртка изображения */
  .gallery-image-wrapper {
    @apply bg-surface-card;
    @apply shadow-soft hover:shadow-elevated;
    @apply transition-shadow duration-300;
  }
  
  /* Оверлей при наведении */
  .gallery-overlay {
    @apply flex items-center justify-center;
    @apply transition-opacity duration-200;
  }
  
  /* Подпись к фото */
  .gallery-item figcaption {
    @apply text-left;
  }
  
  /* Анимация масштабирования */
  .gallery-item img {
    @apply transition-transform duration-300;
  }
  .gallery-item:hover img {
    @apply scale-105;
  }
  
  /* ============================================
     КАСТОМНЫЙ СКРОЛЛБАР (без плагинов)
     ============================================ */
  .gallery-scroll-mobile {
    @apply overflow-x-auto;
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: theme('colors.border.subtle') transparent; /* Firefox */
  }
  
  .gallery-scroll-mobile::-webkit-scrollbar {
    height: 6px;
  }
  
  .gallery-scroll-mobile::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .gallery-scroll-mobile::-webkit-scrollbar-thumb {
    background-color: theme('colors.border.subtle');
    border-radius: 3px;
  }
  
  .gallery-scroll-mobile::-webkit-scrollbar-thumb:hover {
    background-color: theme('colors.action.primary');
  }
  
  /* ============================================
     LIGHTBOX (опционально)
     ============================================ */
  .lightbox-overlay {
    @apply fixed inset-0 z-50 bg-surface-main/95 backdrop-blur-sm;
    @apply flex items-center justify-center p-4;
  }
}

@layer components {
  /* ============================================
     FEATURES SECTION — Grid Cards
     ============================================ */
  .features {
    @apply py-18 lg:py-24;
    @apply bg-surface-main;
  }
  
  .card-feature {
    @apply bg-surface-card rounded-2xl p-6;
    @apply border border-border-subtle;
    @apply hover:shadow-card-hover hover:border-action-primary/30;
    @apply transition-all duration-300;
  }
  
  .feature-icon {
    @apply transition-transform duration-300;
  }
  .card-feature:hover .feature-icon {
    @apply scale-110;
  }
  
  /* ============================================
     FEATURES SECTION — Alternating
     ============================================ */
  .features-alt {
    @apply py-18 lg:py-24;
    @apply bg-surface-main;
  }
  
  /* ✅ Исправленная анимация */
  .feature-alternating {
    @apply animate-fade-in;
    animation-fill-mode: both; /* Сохраняет состояние после анимации */
  }
  
  /* Каскадная задержка */
  .feature-alternating:nth-of-type(1) {
    animation-delay: 0.1s;
  }
  .feature-alternating:nth-of-type(2) {
    animation-delay: 0.3s;
  }
  .feature-alternating:nth-of-type(3) {
    animation-delay: 0.5s;
  }
  
  .feature-icon-small {
    @apply inline-flex items-center justify-center;
  }
  
  .feature-content ul {
    @apply list-none;
  }
  
  .feature-image img {
    @apply transition-transform duration-300;
  }
  .feature-image:hover img {
    @apply scale-105;
  }
  
  /* ============================================
     FEATURES SECTION — Minimal
     ============================================ */
  .features-minimal {
    @apply bg-surface-card border-t border-border-subtle;
  }
  
  .feature-minimal-item {
    @apply transition-transform duration-200;
  }
  .feature-minimal-item:hover {
    @apply translate-x-1;
  }
  
  /* ============================================
     FEATURES SECTION — Stats
     ============================================ */
  .features-stats {
    @apply py-18 lg:py-24;
    @apply bg-surface-main;
  }
  
  .stat-item {
    @apply transition-transform duration-300;
  }
  .stat-item:hover {
    @apply -translate-y-1;
  }
}


@layer components {
  /* ============================================
     HEADER — Minimal
     ============================================ */
  .header-minimal {
    @apply bg-surface-main/95 backdrop-blur-sm border-b border-border-subtle;
  }
  
  .logo-minimal {
    @apply text-xl font-bold text-content-primary hover:text-action-primary;
    @apply transition-colors duration-200;
  }
  
  .nav-link-minimal {
    @apply text-content-secondary hover:text-action-primary text-sm font-medium;
    @apply transition-colors duration-200;
  }
  
  /* ============================================
     HEADER — With CTA
     ============================================ */
  .header-cta {
    @apply bg-surface-card/95 backdrop-blur-sm shadow-soft border-b border-border-subtle;
  }
  
  .logo-cta {
    @apply flex items-center gap-2 hover:opacity-80 transition-opacity;
  }
  
  .nav-link-cta {
    @apply text-content-secondary hover:text-action-primary font-medium;
    @apply transition-colors duration-200;
  }
  
  .btn-header-cta {
    @apply inline-flex items-center justify-center;
    @apply px-5 py-2.5 rounded-action font-semibold text-sm;
    @apply bg-action-primary text-content-inverted;
    @apply hover:bg-action-primaryHover transition-colors duration-200;
    @apply shadow-soft hover:shadow-elevated;
  }
  
  /* ============================================
     HEADER — Transparent
     ============================================ */
  .header-transparent {
    @apply bg-transparent;
  }

  .header-transparent-scrolled {
    @apply bg-surface-card/95 backdrop-blur-sm shadow-soft;
  }

  /* Логотип */
  .header-transparent-scrolled .logo-transparent,
  .header-transparent-scrolled .nav-link-transparent,
  .header-transparent-scrolled button {
    @apply text-content-primary;
  }

  .header-transparent-scrolled .logo-transparent:hover,
  .header-transparent-scrolled .nav-link-transparent:hover,
  .header-transparent-scrolled button:hover {
    @apply text-action-primary;
  }

  .logo-transparent {
    @apply text-2xl font-bold text-content-inverted;
    @apply hover:text-content-inverted/80;
    @apply transition-colors duration-200;
  }

  .nav-link-transparent {
    @apply text-content-inverted/90 hover:text-content-inverted font-medium;
    @apply transition-colors duration-200;
  }

  /* Кнопка */
  .btn-header-transparent {
    @apply inline-flex items-center justify-center;
    @apply px-5 py-2.5 rounded-action font-semibold text-sm;
    @apply bg-content-inverted/20 backdrop-blur-sm text-content-inverted;
    @apply border border-content-inverted/30;
    @apply hover:bg-content-inverted/30;
    @apply transition-colors duration-200;
  }

  .header-transparent-scrolled .btn-header-transparent {
    @apply bg-action-primary text-content-inverted border-action-primary;
    @apply hover:bg-action-primaryHover;
  }
  
  /* ============================================
     HEADER — Multi-row
     ============================================ */
  .header-multi {
    @apply sticky top-0 z-50;
  }
  
  .header-top {
    @apply bg-surface-contrast/5 border-b border-border-subtle;
  }
  
  .header-main {
    @apply bg-surface-card/95 backdrop-blur-sm border-b border-border-subtle;
  }
  
  .logo-multi {
    @apply flex items-center gap-2 hover:opacity-80 transition-opacity;
  }
  
  .nav-link-multi {
    @apply text-content-primary hover:text-action-primary font-medium px-4 py-2 rounded-action;
    @apply transition-colors duration-200;
  }
  
  .btn-header-multi {
    @apply inline-flex items-center justify-center;
    @apply px-5 py-2.5 rounded-action font-semibold text-sm;
    @apply bg-action-primary text-content-inverted;
    @apply hover:bg-action-primaryHover transition-colors duration-200;
    @apply shadow-soft hover:shadow-elevated;
  }
}


/* ============================================
   УТИЛИТЫ (если не поддерживаются в @layer)
   ============================================ */
@supports not (transition-property: width) {
  .nav-link::after {
    transition: width 0.25s ease;
  }
}

/* ============================================
   ТИПОГРАФИКА
   ============================================ */
@layer base {
  body {
    @apply bg-surface-main text-content-primary font-sans antialiased;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading text-content-primary;
  }
}
 
`)