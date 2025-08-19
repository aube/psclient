import { defineStore } from 'pinia'
import { routes } from '../router/routes'


export const useNavigationStore = defineStore('navigation', () => {
  const topNav = routes.map(route => ({
    name: route.name,
    path: route.path,
  })).filter(route => route.path > '/')

  return { topNav }
})
