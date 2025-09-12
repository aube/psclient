import { defineStore } from 'pinia'
import { useSiteAPI } from '../api/rest/site.api';
import { Site, SiteNew, SitesList } from '../types/Site.types';
import { useNotificationStore, loadNotifications } from './notification';

const {
  create,
  read,
  update,
  remove,
  list,
  exists,
} = useSiteAPI()

let notifications: ReturnType<typeof useNotificationStore>
loadNotifications().then(ntf => {
  notifications = ntf as ReturnType<typeof useNotificationStore>
})

export const useSitesStore = defineStore('sites', {

  state: () => ({
    sites: {} as SitesList,
  }),

  actions: {
    async fetchSites() {
      try {
        this.sites = await list()
        return this.sites
      } catch (e) {
        notifications?.danger(e)
      }
    },

    async listSites() {
      return this.sites
    },

    async getSite(name: string): Promise<Site | null> {
      try {
        const site = await read(name)
        return site
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    getSiteByName(name: string): Site | null {
      return this.sites.rows.find(site => {
        return site.name === name
      }) || null
    },

    async siteExists(name: string, id: number = 0): Promise<boolean> {
      const nameBusy = await exists(name, id)
      return nameBusy
    },

    async updateSite(formData: Site): Promise<boolean> {
      try {
        await update(formData)
        notifications?.success("Изменения сохранены")
        return true
      } catch (e) {
        notifications?.danger(e)
      }
      return false
    },

    async createSite(formData: SiteNew): Promise<boolean> {
      try {
        await create(formData)
        notifications?.success("Сайт создан")
        return true
      } catch (e) {
        notifications?.danger(e)
      }
      return false
    },

    async deleteSite(id: number): Promise<boolean> {
      try {
        const result = await remove(id)
        if (result) {
          notifications?.success("Сайт перенесен в корзину")
        } else {
          notifications?.danger("Что-то пошло не так")
        }
        return result
      } catch (e) {
        notifications?.danger(e)
        return false
      }
    },
  },
})


// load store inside depends on SSR and app initial state
// export function loadSitesStore(onlyClient = false) {
//   if (onlyClient && !isBrowser) {
//     return Promise.resolve()
//   }

//   return new Promise((resolve) => {
//     function initStore() {
//       if (!getActivePinia()) {
//         setTimeout(initStore, 100)
//         return
//       }
//       resolve(useSitesStore())
//     }
//     initStore()
//   })
// }
