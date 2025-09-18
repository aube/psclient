import { useRestApi } from '../../lib/restapi.js'
import { Template, TemplateNew, Templates, Pagination } from '../../types'

const { get, put, post, del } = useRestApi()

export const useTemplateAPI = () => {

  const create = async (formData: TemplateNew): Promise<Template> => {
    const response = await post<Template>('/api/v1/template', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no response data")
    }
    return response.data
  }

  const update = async (formData: Template): Promise<Template> => {
    const response = await put<Template>('/api/v1/template', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no response data")
    }
    return response.data
  }

  const read = async (id: number): Promise<Template> => {
    const response = await get<Template>('/api/v1/template/' + id)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no response data")
    }
    return response.data
  }

  const exists = async (name: string): Promise<Template|null> => {
    const response = await get<Template>('/api/v1/template?name=' + name)
    return response.data
  }

  const remove = async (id: number): Promise<boolean> => {
    const response = await del<Template>('/api/v1/template/' + id)
    if (!response) {
      throw Error("deletion error")
    }
    return true
  }

  const sort = async (ID: number, afterID: number): Promise<boolean> => {
    const response = await post<{ID: number, afterID: number}>('/api/v1/template/sort', { ID, afterID })
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no response data")
    }
    return true
  }

  const list = async (): Promise<{rows:Templates; pagination:Pagination}> => {
    const response = await get<{rows:Templates; pagination:Pagination}>('/api/v1/templates')
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