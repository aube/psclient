
import { useRestApi } from '../../lib/restapi.js'
import { Site, SiteNew } from '../../types/Site.types.js'

const { get, put, post, del, setHeader } = useRestApi()

export const useSiteAPI = () => {
  const setCurrentID = (id: number): void => {
    setHeader('x-site-id', id)
  }

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

  const exists = async (name: string, id: number): Promise<boolean> => {
    const response = await get<Site>('/api/v1/site/' + name)
    if (!response.data) {
      return false
    }
    if (id && id == response.data.id) {
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

  const list = async (page: number, size: number): Promise<Site[]> => {
    const params: Record<string, string> = {}
    if (page > 0) {
      params['page'] = page.toString()
    }
    if (size > 0) {
      params['size'] = size.toString()
    }
    const queryString = new URLSearchParams(params).toString()
    const response = await get<Site[]>('/api/v1/sites' + (queryString ? `?${queryString}` : ''))
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no response data")
    }
    return response.data
  }

  return {
    setCurrentID,
    create,
    read,
    update,
    remove,
    list,
    exists,
  }
}