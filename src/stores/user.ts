import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

interface IUser {
  id: number;
  username: string;
  email: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref(null as IUser | null)
  const isAuthenticated = computed(() => user.value !== null)

  function setUser(data: IUser) {
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

  return { isAuthenticated, setUser, currentUser, clearUser }
})
