import { useRestApi } from '../../lib/restapi.js'
import { Template, Templates } from '../../types'

const { get } = useRestApi()

export const useTemplateAPI = () => {


  const read = async (id: number): Promise<Template> => {
    const response = await get<Template>('/api/v1/template/' + id)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no response data")
    }
    return response.data
  }


  const list = async (): Promise<Templates> => {
    const response = await get<Templates>('/api/v1/templates/guest')
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  return {
    read,
    list,
  }
}