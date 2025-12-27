import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { usePagesStore } from '../stores/pages'
// import { useSitesStore } from '../stores/sites'
// import { setActiveSiteID } from '../lib/restapi'

// let userStore: ReturnType<typeof useUserStore>
// const loadingUser = loadUserStore().then(store => {
//   userStore = store as ReturnType<typeof useUserStore>
// })

// let sitesStore: ReturnType<typeof useSitesStore>
// const loadingSites = loadSitesStore().then(store => {
//   sitesStore = store as ReturnType<typeof useSitesStore>
// })



export const pageDataRequester = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {

  const pagesStore = usePagesStore()

  pagesStore.fetchCurrent(to.path)
  console.log(to.path)


  next()
}