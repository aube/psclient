import { defineStore } from 'pinia'
import { useSiteAPI } from '../api/rest/site.api';
import { Site, SiteNew } from '../types/Site.types';
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
  return defineStore('sites', () => {

    async function getSite(name: string): Promise<Site | null> {
      try {
        const site = await read(name)
        return site
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    }

    async function siteExists(name: string): Promise<boolean> {
      const nameBusy = await exists(name)
      return nameBusy
    }

    async function updateSite(formData: Site): Promise<Site | null> {
      try {
        const site = await update(formData)
        notifications?.success("Изменения сохранены")
        return site
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    }

    async function createSite(formData: SiteNew): Promise<Site | null> {
      try {
        const site = await create(formData)
        notifications?.success("Сайт создан")
        return site
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    }

    async function deleteSite(id: number): Promise<boolean> {
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
    }

    async function listSites() {
      try {
        const sites = await list()
        return sites
      } catch (e) {
        notifications?.danger(e)
      }
    }

    return {
      getSite,
      updateSite,
      deleteSite,
      createSite,
      listSites,
      siteExists,
    }
  })()
}
