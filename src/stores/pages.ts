import { defineStore } from 'pinia'
import { usePageAPI } from '../api/rest/page.api';
import { Page, Pages, PageNew, Pagination } from '../types';
import { useNotificationStore, loadNotifications } from './notification';


const {
  create,
  read,
  update,
  remove,
  list,
  exists,
} = usePageAPI()


let notifications: ReturnType<typeof useNotificationStore>
loadNotifications().then(ntf => {
  notifications = ntf as ReturnType<typeof useNotificationStore>
})

export const usePagesStore = defineStore('pages', {

  state: () => ({
    pages: [] as Pages,
    pagination: {} as Pagination | null,
  }),

  actions: {
    async fetchPages(parentID:number = 0): Promise<Pages> {
      try {
        const { rows, pagination } = await list(parentID)
        this.pages = rows
        this.pagination = pagination
      } catch (e) {
        notifications?.danger(e)
        this.pages = []
        this.pagination = null
      }
      return this.pages
    },

    async listPages() {
      return {
        pages: this.pages,
        pagination: this.pagination,
      }
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
        notifications?.success("Страница создана")
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
          notifications?.success("Страница удалена")
        } else {
          notifications?.danger("При удалении произошла ошибка")
        }
        return result
      } catch (e) {
        notifications?.danger(e)
        return false
      }
    },

  },
})
