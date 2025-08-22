import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useUserStore } from '../stores/user'

export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const userStore = useUserStore(null)

  if (to.meta.guestAccess) {
    return next()
  } else if (userStore.isAuthenticated) {
    return next()
  }

  next({ name: 'error403' })
}