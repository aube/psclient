import {createMemoryHistory, createRouter, createWebHistory} from 'vue-router'
import {routes} from './routes'

const history = import.meta.env.SSR
  ? createMemoryHistory()
  : createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history,
  routes,
})

export default router
