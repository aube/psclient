import { defineStore } from 'pinia'
import { useUserAPI } from '../api/rest/user.api';
import { User } from '../types/User.types';
import { useNotificationStore } from './notification';
import { setCookie } from '../lib/cookies.node.js'


const {
  login,
  register,
} = useUserAPI()

let notifications: ReturnType<typeof useNotificationStore> | null

export const useUserStore = (ntf: ReturnType<typeof useNotificationStore> | null) => {
  if (ntf) {
    notifications = ntf
  }

  return (defineStore('user', {

    state: () => ({
      user: null as User | null,
      token: '',
    }),

    getters: {
      isAuthenticated: (state) => Boolean(state.user?.id),
    },

    actions: {
      setUser(data: User | null) {
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
          notifications?.success("Авторизация успешна", "Привет, " + user.username)
        } catch (e) {
          notifications?.danger(e)
        }
      },

      async logoutUser() {
        window.location.replace('/login?logout=1')
      },

      async registerUser(formData: User) {
        try {
          const user = await register(formData)
          this.setUser(user)
          notifications?.success("Регистрация успешна", "Привет, " + user.username)
        } catch (e) {
          notifications?.danger(e)
        }
      },
    },
  }))()
}
