import { defineStore } from 'pinia'
import { useImageAPI } from '../api/rest/image.api';
import { Image, Images, ImageNew, Pagination } from '../types';
import { useNotificationStore, loadNotifications } from './notification';


const {
  create,
  downloadImage,
  update,
  remove,
  list,
} = useImageAPI()


let notifications: ReturnType<typeof useNotificationStore>
loadNotifications().then(ntf => {
  notifications = ntf as ReturnType<typeof useNotificationStore>
})

export const useImagesStore = defineStore('images', {

  state: () => ({
    images: [] as Images,
    pagination: {} as Pagination | null,
  }),

  actions: {
    async fetchImages(): Promise<Images> {
      try {
        const { rows, pagination } = await list()
        this.images = rows
        this.pagination = pagination
      } catch (e) {
        notifications?.danger(e)
        this.images = []
        this.pagination = null
      }
      return this.images
    },

    async listImages() {
      return {
        images: this.images,
        pagination: this.pagination,
      }
    },

    async download(uuid: string, name: string) {
      try {
        await downloadImage(uuid, name)
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    async updateImage(formData: Image): Promise<Image | null> {
      try {
        const image = await update(formData)
        notifications?.success("Изменения сохранены")
        return image
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    async createImage(formData: ImageNew): Promise<Image | null> {
      try {
        const image = await create(formData)
        notifications?.success("Изображение загружено")
        return image
      } catch (e) {
        notifications?.danger(e)
        return null
      }
    },

    async deleteImage(id: number): Promise<boolean> {
      try {
        const result = await remove(id)
        if (result) {
          notifications?.success("Изображение удалено")
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
