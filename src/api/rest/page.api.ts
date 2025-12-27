import { useRestApi } from '../../lib/restapi.js'
import { Page, PageNew, Pages, Pagination } from '../../types'

const { get, put, post, del } = useRestApi()

export const usePageAPI = () => {


  const read = async (path: string): Promise<Page> => {
    const response = await get<Page>(path)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const list = async (parentID: number = 0): Promise<{rows:Pages; pagination:Pagination}> => {
    const response = await get<{rows:Pages; pagination:Pagination}>('/api/v1/pages/' + parentID)
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