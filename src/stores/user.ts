import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserAPI } from '../api/rest/user.api';
import { User } from '../types/User.types';
import { useNotificationStore } from './notification';
// @ts-expect-error - hasn't d.ts, but i tak soidet
import { setCookie } from '../lib/cookies.js'

const isBrowser = typeof window !== "undefined"
const {
  login,
  register,
} = useUserAPI()


export const useUserStore = (notifications: ReturnType<typeof useNotificationStore>) => {
  return defineStore('user', () => {
    const user = ref(null as User | null)
    const token = ref("")
    const isAuthenticated = computed(() => user.value !== null)

    function setUser(data: User) {
      user.value = data
    }

    function setToken(data: string) {
      token.value = data
      setCookie('auth_token', data, {
        expirationHours: 1,
        httpOnly: false,
      })
    }

    function currentUser() {
      return {
        ...user.value,
      }
    }

    function clearUser() {
      user.value = null
    }

    async function loginUser(formData: User) {
      try {
        const user = await login(formData)
        if (user.token) {
          setToken(user.token)
          delete user.token
        }
        setUser(user)
        notifications?.success("Авторизация успешна", "Привет, " + user.username)
      } catch (e) {
        notifications?.danger(e)
      }
    }

    async function registerUser(formData: User) {
      try {
        const user = await register(formData)
        setUser(user)
        notifications?.success("Регистрация успешна", "Привет, " + user.username)
      } catch (e) {
        notifications?.danger(e)
      }
    }


    const SSRAuthResult = isBrowser ? window.user : null
    if (SSRAuthResult) {
      console.log("SSRAuthResult", SSRAuthResult)
      setUser(SSRAuthResult)
    }

    return {
      isAuthenticated,
      setUser,
      currentUser,
      clearUser,
      loginUser,
      registerUser,
    }
  })()
}
