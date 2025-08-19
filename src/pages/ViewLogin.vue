<template>
  <div>
    <UserLogin @submit="loginUser" />
  </div>
</template>

<script setup>
import UserLogin from '../entities/user/UserLogin.vue';


// import { useNotificationStore } from '@/stores/notification'
import { useRestApi } from '../lib/restapi.js'
import { useRouter } from 'vue-router'

// const { showSuccess, showDanger } = useNotificationStore()
const { post } = useRestApi()
const router = useRouter()

const loginUser = async (formData) => {
  const response = await post('/api/v1/login', formData)
  if (!response.error) {
    // showSuccess('Добро пожаловать, ' + formData.username + '!')
    router.push({ name: 'home' })
    localStorage.setItem("token", response.data.token)
  } else {
    // showDanger('Ошибка аутентификации. Проверьте введённые данные.')
  }
}
</script>
