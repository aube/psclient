import { useRestApi } from '../../lib/restapi.js'
import { Upload, UploadNew, Uploads, Pagination } from '../../types'

const { get, put, post, del } = useRestApi()

export const useUploadsAPI = () => {

  const create = async (formData: UploadNew): Promise<Upload> => {
    const response = await post<Upload>('/api/v1/upload', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const update = async (formData: Upload): Promise<Upload> => {
    const response = await put<Upload>('/api/v1/upload', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const read = async (name: string): Promise<Upload> => {
    const response = await get<Upload>('/api/v1/upload/' + name)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const remove = async (id: number): Promise<boolean> => {
    const response = await del<Upload>('/api/v1/upload/' + id)
    if (!response) {
      throw Error("deletion error")
    }
    return true
  }


  const list = async (parentID: number = 0): Promise<{rows:Uploads; pagination:Pagination}> => {
    const response = await get<{rows:Uploads; pagination:Pagination}>('/api/v1/uploads/' + parentID)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  return {
    create,
    read,
    update,
    remove,
    list,
  }
}