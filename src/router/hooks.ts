import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useSitesStore } from '../stores/sites'
import { setActiveSiteID } from '../lib/restapi'

// let userStore: ReturnType<typeof useUserStore>
// const loadingUser = loadUserStore().then(store => {
//   userStore = store as ReturnType<typeof useUserStore>
// })

// let sitesStore: ReturnType<typeof useSitesStore>
// const loadingSites = loadSitesStore().then(store => {
//   sitesStore = store as ReturnType<typeof useSitesStore>
// })


export const guestGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {

  // await loadingUser
  const userStore = useUserStore()

  if (to.meta.guestAccess) {
    return next()
  } else if (userStore?.isAuthenticated) {
    return next()
  }

  next({ name: 'error403' })
}

export const activeSiteSelector = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {

  // await loadingSites
  const sitesStore = useSitesStore()

  const siteName = to.params?.siteName as string
  if (siteName) {
    const site = sitesStore.getSiteByName(siteName)
    if (site) {
      sitesStore.currentSite = site
    }

    setActiveSiteID(Number(site?.id))
  }

  next()
}