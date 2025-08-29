
import { useRestApi } from '../../lib/restapi.js'
import { Site, SiteNew } from '../../types/Site.types.js'

const { get, put, post, del } = useRestApi()

export const useSiteAPI = () => {

  const create = async (formData: SiteNew): Promise<Site> => {
    const response = await post<Site>('/api/v1/site', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const update = async (formData: Site): Promise<Site> => {
    const response = await put<Site>('/api/v1/site', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const read = async (name: string): Promise<Site> => {
    const response = await get<Site>('/api/v1/site/' + name)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const exists = async (name: string): Promise<boolean> => {
    const response = await get<Site>('/api/v1/site/' + name)
    if (!response.data) {
      return false
    }
    return true
  }

  const remove = async (id: number): Promise<boolean> => {
    const response = await del<Site>('/api/v1/site/' + id)
    if (!response) {
      throw Error("deletion error")
    }
    return true
  }

  const list = async (): Promise<Site[]> => {
    const response = await get<Site[]>('/api/v1/sites')
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
    exists,
  }
}