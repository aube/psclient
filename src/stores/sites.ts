import { defineStore } from 'pinia'
import { useSiteAPI } from '../api/rest/site.api';
import { Site, SiteNew, SitesList } from '../types/Site.types';
import { useNotificationStore } from './notification';


const {
  create,
  read,
  update,
  remove,
  list,
  exists,
} = useSiteAPI()


export const useSitesStore = (notifications: ReturnType<typeof useNotificationStore> | null) => {
  return (defineStore('sites', {

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

      async siteExists(name: string, id: number = 0): Promise<boolean> {
        const nameBusy = await exists(name, id)
        return nameBusy
      },

      async updateSite(formData: Site): Promise<Site | null> {
        try {
          const site = await update(formData)
          notifications?.success("Изменения сохранены")
          this.fetchSites()
          return site
        } catch (e) {
          notifications?.danger(e)
          return null
        }
      },

      async createSite(formData: SiteNew): Promise<Site | null> {
        try {
          const site = await create(formData)
          notifications?.success("Сайт создан")
          this.fetchSites()
          return site
        } catch (e) {
          notifications?.danger(e)
          return null
        }
      },

      async deleteSite(id: number): Promise<boolean> {
        try {
          const result = await remove(id)
          if (result) {
            notifications?.success("Сайт перенесен в корзину")
            this.fetchSites()
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
  )()
}
