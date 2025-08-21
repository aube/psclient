import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserAPI } from '../api/rest/user.api';
import { User } from '../types/User.types';
import { useNotificationStore } from './notification';
// @ts-expect-error - hasn't d.ts, but i tak soidet
import { setCookie } from '../lib/cookies.js'

const {
  login,
  register,
} = useUserAPI()
const notifications = useNotificationStore()

export const useUserStore = defineStore('user', {
  state: () => ({
    user: ref(null as User | null),
    token: ref(""),
    isAuthenticated: false,
  }),

  actions: {
    setUser(data: User) {
      this.user = data
    },

    setToken(data: string) {
      this.token = data
      setCookie('auth_token', data, {
        expirationHours: 1,
        httpOnly: false,
      })
    },

    currentUser() {
      return {
        ...this.user,
      }
    },

    clearUser() {
      this.user = null
    },

    async loginUser(formData: User) {
      try {
        const user = await login(formData)
        if (user.token) {
          this.setToken(user.token)
          delete user.token
        }
        this.setUser(user)
        notifications.success("Авторизация успешна", "Привет, " + user.username)
      } catch (e) {
        notifications.danger(e)
      }
    },

    async registerUser(formData: User) {
      try {
        const user = await register(formData)
        this.setUser(user)
        notifications.success("Регистрация успешна", "Привет, " + user.username)
      } catch (e) {
        notifications.danger(e)
      }
    },
  },
  // return {
  //   isAuthenticated,
  //   setUser,
  //   currentUser,
  //   clearUser,
  //   loginUser,
  //   registerUser,
  // }
})



// const SSRAuthResult = typeof window !== "undefined" ? window.user : null
// if (SSRAuthResult) {
//   setUser(SSRAuthResult)
// }