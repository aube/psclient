
import { useRestApi } from '../../lib/restapi.js'
import { User } from '../../types/User.types.js'

const { get, post } = useRestApi()

export const useUserAPI = () => {

  const login = async (formData: User): Promise<User> => {
    const response = await post<User>('/api/v1/login', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const register = async (formData: User): Promise<User> => {
    const response = await post<User>('/api/v1/register', formData)
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  const profile = async (): Promise<User> => {
    const response = await get<User>('/api/v1/user')
    if (!response.data) {
      if (response.error)
        throw Error(response.error)

      throw Error("no resoponse data")
    }
    return response.data
  }

  return {
    login,
    register,
    profile,
  }
}