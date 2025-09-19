import { useRestApi } from '../../lib/restapi.js'
import { Image, ImageNew, Images, Pagination } from '../../types'

const { get, put, post, del, download } = useRestApi()

export const useImageAPI = () => {

  const create = async (formData: ImageNew): Promise<Image> => {
    const response = await post<Image>('/api/v1/image', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const update = async (formData: Image): Promise<Image> => {
    const response = await put<Image>('/api/v1/image', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const downloadImage = async (uuid: string, filename: string) => {
    await download('/api/v1/image?uuid=' + uuid, filename)
  }

  const remove = async (id: number): Promise<boolean> => {
    const response = await del<Image>('/api/v1/image/' + id)
    if (!response) {
      throw Error("deletion error")
    }
    return true
  }


  const list = async (): Promise<{rows:Images; pagination:Pagination}> => {
    const response = await get<{rows:Images; pagination:Pagination}>('/api/v1/images')
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  return {
    create,
    downloadImage,
    update,
    remove,
    list,
  }
}