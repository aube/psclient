import { defineStore } from 'pinia'
import { usePageAPI } from '../api/rest/page.api';
import { Page, PageNew, PagesList } from '../types/Page.types';
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
  return (defineStore('pages', {

    state: () => ({
      pages: {} as PagesList,
    }),

    actions: {
      async fetchPages() {
        try {
          this.pages = await list()
          return this.pages
        } catch (e) {
          notifications?.danger(e)
        }
      },

      async listPages() {
        return this.pages
      },

      async getPage(name: string): Promise<Page | null> {
        try {
          const page = await read(name)
          return page
        } catch (e) {
          notifications?.danger(e)
          return null
        }
      },

      async pageExists(name: string, id: number = 0): Promise<boolean> {
        const nameBusy = await exists(name, id)
        return nameBusy
      },

      async updatePage(formData: Page): Promise<Page | null> {
        try {
          const page = await update(formData)
          notifications?.success("Изменения сохранены")
          return page
        } catch (e) {
          notifications?.danger(e)
          return null
        }
      },

      async createPage(formData: PageNew): Promise<Page | null> {
        try {
          const page = await create(formData)
          notifications?.success("Сайт создан")
          return page
        } catch (e) {
          notifications?.danger(e)
          return null
        }
      },

      async deletePage(id: number): Promise<boolean> {
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
  }))()
}
