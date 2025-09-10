import { defineStore } from 'pinia'
import { usePageAPI } from '../api/rest/page.api';
import { Page, PageNew } from '../types/Page.types';
import { useNotificationStore } from './notification';


const {
  create,
  read,
  update,
  remove,
  list,
  exists,
} = usePageAPI()


export const usePagesStore = (notifications: ReturnType<typeof useNotificationStore> | null) => {
  return defineStore('pages', () => {

    async function getPage(name: string): Promise<Page | null> {
      try {
        const page = await read(name)
        return page
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    }

    async function pageExists(name: string, id: number = 0): Promise<boolean> {
      const nameBusy = await exists(name, id)
      return nameBusy
    }

    async function updatePage(formData: Page): Promise<Page | null> {
      try {
        const page = await update(formData)
        notifications?.success("Изменения сохранены")
        return page
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    }

    async function createPage(formData: PageNew): Promise<Page | null> {
      try {
        const page = await create(formData)
        notifications?.success("Сайт создан")
        return page
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    }

    async function deletePage(id: number): Promise<boolean> {
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

    async function listPages() {
      try {
        const pages = await list()
        return pages
      } catch (e) {
        notifications?.danger(e)
      }
    }

    return {
      getPage,
      updatePage,
      deletePage,
      createPage,
      listPages,
      pageExists,
    }
  })()
}
