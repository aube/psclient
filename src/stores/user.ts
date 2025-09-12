import { defineStore } from 'pinia'
import { useUserAPI } from '../api/rest/user.api';
import { User } from '../types/User.types';
import { useNotificationStore, loadNotifications } from './notification';
import { setCookie } from '../lib/cookies.node.js'

const {
  login,
  register,
} = useUserAPI()

let notifications: ReturnType<typeof useNotificationStore>
loadNotifications().then(ntf => {
  notifications = ntf as ReturnType<typeof useNotificationStore>
})

export const useUserStore = defineStore('user', {
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

    async loginUser(formData: User): Promise<boolean> {
      try {
        const user = await login(formData)
        if (user.token) {
          this.setToken(user.token)
          delete user.token
        }
        this.setUser(user)
        notifications?.success("Авторизация успешна", "Привет, " + user.username)
        return true
      } catch (e) {
        notifications?.danger(e)
      }
      return false
    },

    async logoutUser() {
      window.location.replace('/login?logout=1')
    },

    async registerUser(formData: User): Promise<boolean> {
      try {
        const user = await register(formData)
        this.setUser(user)
        notifications?.success("Регистрация успешна", "Привет, " + user.username)
        return true
      } catch (e) {
        notifications?.danger(e)
      }
      return false
    },
  },
})

// load store inside depends on SSR and app initial state
// export function loadUserStore(onlyClient = false) {
//   if (onlyClient && !isBrowser) {
//     return Promise.resolve()
//   }

//   return new Promise((resolve) => {
//     function initStore() {
//       if (!getActivePinia()) {
//         setTimeout(initStore, 100)
//         return
//       }
//       resolve(useUserStore())
//     }
//     initStore()
//   })
// }
