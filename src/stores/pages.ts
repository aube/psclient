import { defineStore } from 'pinia'
import { usePageAPI } from '../api/rest/page.api';
import { Page, Pages, Pagination } from '../types';
import { useNotificationStore, loadNotifications } from './notification';


const {
  read,
  list,
} = usePageAPI()


let notifications: ReturnType<typeof useNotificationStore>
loadNotifications().then(ntf => {
  notifications = ntf as ReturnType<typeof useNotificationStore>
})

export const usePagesStore = defineStore('pages', {

  state: () => ({
    pages: [] as Pages,
    pagination: {} as Pagination | null,
    current: {} as Page,
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

    async fetchCurrent(path: string): Promise<Page | null> {

      try {
        this.current = await read(path)
        return this.current
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

  },
})
