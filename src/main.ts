import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
// import { createAppPinia } from './stores'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Aura from '@primeuix/themes/aura';


// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.p-dark',
        cssLayer: false,
      },
    },
  });

  app.use(router)
  app.use(pinia)
  app.use(ToastService)

  return { app, router, pinia }
}



