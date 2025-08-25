import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useSiteAPI } from '../api/rest/site.api';
import { Site } from '../types/Site.types';
import { useNotificationStore } from './notification';


const {
  create,
  read,
  update,
  remove,
  list,
} = useSiteAPI()


export const useSitesStore = (notifications: ReturnType<typeof useNotificationStore> | null) => {
  return defineStore('sites', () => {
    const site = ref(null as Site | null)
    const sites = ref([] as Site[])

    function setSite(data: Site | null) {
      site.value = data
    }

    function setSites(data: Site[]) {
      sites.value = data
    }

    function currentSite() {
      return {
        ...site.value,
      }
    }

    async function selectSite(id: number) {
      try {
        const site = await read(id)
        setSite(site)
      } catch (e) {
        notifications?.danger(e)
      }
    }

    async function updateSite(formData: Site) {
      try {
        const user = await update(formData)
        setSite(user)
        notifications?.success("Изменения сохранены")
      } catch (e) {
        notifications?.danger(e)
      }
    }

    async function createSite(formData: Site) {
      try {
        const user = await create(formData)
        setSite(user)
        notifications?.success("Сайт создан")
      } catch (e) {
        notifications?.danger(e)
      }
    }

    async function deleteSite(id: number) {
      try {
        const result = await remove(id)
        if (result) {
          setSite(null)
          notifications?.success("Сайт перенесен в корзину")
        } else {
          notifications?.danger("Что-то пошло не так")
        }
      } catch (e) {
        notifications?.danger(e)
      }
    }

    async function listSites() {
      try {
        const sites = await list()
        setSites(sites)
      } catch (e) {
        notifications?.danger(e)
      }
    }

    return {
      currentSite,
      selectSite,
      updateSite,
      deleteSite,
      createSite,
      listSites,
    }
  })()
}
