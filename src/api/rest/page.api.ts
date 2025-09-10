import { useRestApi } from '../../lib/restapi.js'
import { Page, PageNew } from '../../types/Page.types.js'

const { get, put, post, del } = useRestApi()

export const usePageAPI = () => {

  const create = async (formData: PageNew): Promise<Page> => {
    const response = await post<Page>('/api/v1/page', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const update = async (formData: Page): Promise<Page> => {
    const response = await put<Page>('/api/v1/page', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const read = async (name: string): Promise<Page> => {
    const response = await get<Page>('/api/v1/page/' + name)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const exists = async (name: string, parent_id: number): Promise<boolean> => {
    const response = await get<Page>('/api/v1/page/exists?parent_id=' + parent_id + '&name=' + name)
    if (!response.data) {
      return false
    }
    return true
  }

  const remove = async (id: number): Promise<boolean> => {
    const response = await del<Page>('/api/v1/page/' + id)
    if (!response) {
      throw Error("deletion error")
    }
    return true
  }

  const sort = async (ID: number, afterID: number): Promise<boolean> => {
    const response = await post<{ID: number, afterID: number}>('/api/v1/page/sort', { ID, afterID })
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no response data")
    }
    return true
  }

  const list = async (): Promise<Page[]> => {
    const response = await get<Page[]>('/api/v1/pages')
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
    sort,
    exists,
  }
}