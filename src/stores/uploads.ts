import { defineStore } from 'pinia'
import { useUploadAPI } from '../api/rest/upload.api';
import { Upload, Uploads, UploadNew, Pagination } from '../types';
import { useNotificationStore, loadNotifications } from './notification';


const {
  create,
  downloadFile,
  update,
  remove,
  list,
} = useUploadAPI()


let notifications: ReturnType<typeof useNotificationStore>
loadNotifications().then(ntf => {
  notifications = ntf as ReturnType<typeof useNotificationStore>
})

export const useUploadsStore = defineStore('uploads', {

  state: () => ({
    uploads: [] as Uploads,
    pagination: {} as Pagination | null,
  }),

  actions: {
    async fetchUploads(): Promise<Uploads> {
      try {
        const { rows, pagination } = await list()
        this.uploads = rows
        this.pagination = pagination
      } catch (e) {
        notifications?.danger(e)
        this.uploads = []
        this.pagination = null
      }
      return this.uploads
    },

    async listUploads() {
      return {
        uploads: this.uploads,
        pagination: this.pagination,
      }
    },

    async download(uuid: string, name: string) {
      try {
        await downloadFile(uuid, name)
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    async updateUpload(formData: Upload): Promise<Upload | null> {
      try {
        const upload = await update(formData)
        notifications?.success("Изменения сохранены")
        return upload
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    async createUpload(formData: UploadNew): Promise<Upload | null> {
      try {
        const upload = await create(formData)
        notifications?.success("Файл загружен")
        return upload
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    async deleteUpload(id: number): Promise<boolean> {
      try {
        const result = await remove(id)
        if (result) {
          notifications?.success("Файл удален")
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
