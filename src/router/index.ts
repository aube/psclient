import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { pageDataRequester } from './hooks'

const history = import.meta.env.SSR
  ? createMemoryHistory()
  : createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history,
  routes,
})

// router.beforeEach(guestGuard)
router.beforeEach(pageDataRequester)

export default router
