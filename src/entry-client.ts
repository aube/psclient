import { createApp } from './main'

const { app } = createApp()

// timeout for hydration warnings prevent
setTimeout(() => {
  app.mount('#app')
}, 100)
