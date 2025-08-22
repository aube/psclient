import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { guestGuard } from './hook'

const history = import.meta.env.SSR
  ? createMemoryHistory()
  : createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history,
  routes,
})

router.beforeEach(guestGuard)

export default router
