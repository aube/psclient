import { useRestApi } from '../../lib/restapi.js'
import { Upload, UploadNew, Uploads, Pagination } from '../../types/index.js'

const { get, put, post, del, download } = useRestApi()

export const useUploadAPI = () => {

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

  const downloadFile = async (uuid: string, filename: string) => {
    await download('/api/v1/upload?uuid=' + uuid, filename)
  }

  const remove = async (id: number): Promise<boolean> => {
    const response = await del<Upload>('/api/v1/upload/' + id)
    if (!response) {
      throw Error("deletion error")
    }
    return true
  }


  const list = async (): Promise<{rows:Uploads; pagination:Pagination}> => {
    const response = await get<{rows:Uploads; pagination:Pagination}>('/api/v1/uploads')
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  return {
    create,
    downloadFile,
    update,
    remove,
    list,
  }
}