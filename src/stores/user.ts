import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserAPI } from '../api/rest/user.api';
import { User } from '../types/User.types';
import { useNotificationStore } from './notification';

const { login } = useUserAPI()
const notifications = useNotificationStore()

export const useUserStore = defineStore('user', () => {
  const user = ref(null as User | null)
  const isAuthenticated = computed(() => user.value !== null)

  function setUser(data: User) {
    user.value = data
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
      setUser(user)
    } catch (e) {
      notifications.danger(e)
    }
  }

  return {
    isAuthenticated,
    setUser,
    currentUser,
    clearUser,
    loginUser,
    // registerUser,
  }
})

