import { defineStore } from 'pinia'
import { useTemplateAPI } from '../api/rest/template.api';
import { Template, Templates, TemplateNew, Pagination, Options } from '../types';
import { useNotificationStore, loadNotifications } from './notification';


const {
  create,
  read,
  update,
  remove,
  list,
  exists,
} = useTemplateAPI()


let notifications: ReturnType<typeof useNotificationStore>
loadNotifications().then(ntf => {
  notifications = ntf as ReturnType<typeof useNotificationStore>
})

export const useTemplatesStore = defineStore('templates', {

  state: () => ({
    templates: [] as Templates,
    pagination: {} as Pagination | null,
  }),

  getters: {
    selectOptions(state):Options {
      return [
        {
          label: "Текст",
          value: "default",
        },
        {
          label: "HTML-страница",
          value: "HTML",
        },
        ...state.templates.map(item => ({
          label: item.title,
          value: item.name,
        })),
        // {
        //   label: "md",
        //   value: "Markdown",
        // },
      ]
    },
  },

  actions: {
    async fetchTemplates(): Promise<Templates> {
      try {
        const { rows, pagination } = await list()
        this.templates = rows
        this.pagination = pagination
      } catch (e) {
        notifications?.danger(e)
        this.templates = []
        this.pagination = null
      }
      return this.templates
    },

    async listTemplates() {
      return {
        templates: this.templates,
        pagination: this.pagination,
      }
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

    async templateExists(name: string): Promise<Template | null> {
      const nameBusy = await exists(name)
      return nameBusy
    },

    async updateTemplate(formData: Template): Promise<Template | null> {
      try {
        const template = await update(formData)
        notifications?.success("Изменения сохранены")
        return template
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    async createTemplate(formData: TemplateNew): Promise<Template | null> {
      try {
        const template = await create(formData)
        notifications?.success("Страница создана")
        return template
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    async deleteTemplate(id: number): Promise<boolean> {
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
