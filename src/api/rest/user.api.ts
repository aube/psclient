
import { useRestApi, ApiResponse } from '../../lib/restapi.js'
import { User } from '../../types/User.types.js'

const { post } = useRestApi()

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

  const register = async (formData: User) => {
    const response = await post<ApiResponse<User>>('/api/v1/login', formData)
    if (!response.error) {
      return response.data
    } else {
      throw Error(response.error)
    }
  }

  const profile = async (formData: User) => {
    const response = await post('/api/v1/login', formData)
    if (!response.error) {
      return response.data
    } else {
      throw Error(response.error)
    }
  }

  return {
    login,
    register,
    profile,
  }
}