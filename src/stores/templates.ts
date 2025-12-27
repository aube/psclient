import { defineStore } from 'pinia'
import { useTemplateAPI } from '../api/rest/template.api';
import { Template, Templates, TemplateNew, Pagination, Options } from '../types';
import { useNotificationStore, loadNotifications } from './notification';


const {
  read,
  list,
} = useTemplateAPI()


let notifications: ReturnType<typeof useNotificationStore>
loadNotifications().then(ntf => {
  notifications = ntf as ReturnType<typeof useNotificationStore>
})

export const useTemplatesStore = defineStore('templates', {

  state: () => ({
    templates: [] as Templates,
  }),
  actions: {
    async fetchTemplates(): Promise<Templates> {
      try {
        this.templates = await list()
      } catch (e) {
        notifications?.danger(e)
        this.templates = []
      }
      return this.templates
    },


    async getTemplate(id: number): Promise<Template | null> {
      try {
        const template = await read(id)
        return template
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

  },
})
