<template>
  <div>
    <UserRegisterForm @submit="loginUser" />
  </div>
</template>

<script setup>
import UserRegisterForm from '../entities/user/UserRegisterForm.vue';
// import { useNotificationStore } from '@/stores/notification'
import { useRestApi } from '../lib/restapi.js'
import { useRouter } from 'vue-router'

// const { showSuccess, showDanger } = useNotificationStore()
const { post } = useRestApi()

const registerUser = async (formData) => {
  const response = await post('/api/v1/register', formData)
  if (!response.error) {
    showSuccess('Вы успешно зарегистрированы! Проверьте ваш email для подтверждения.')
  } else {
    showDanger('Ошибка регистрации. Попробуйте позже.')
  }
}
</script>