<template>
  <div>
    <UserLoginForm
      v-if="!isAuthenticated"
      @submit="onSubmit"
    />
    <UserLogoutForm
      v-else
      @submit="onLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user';
import UserLoginForm from '../entities/user/UserLoginForm.vue';
import UserLogoutForm from '../entities/user/UserLogoutForm.vue';
import { User } from '../types/User.types';
import { useRouter } from 'vue-router'

import { useNotificationStore } from '../stores/notification'
const { loginUser, logoutUser, isAuthenticated } = useUserStore(useNotificationStore())

const router = useRouter()

const onSubmit = async (formData: User) => {
  await loginUser(formData)
  router.push('/')
}

const onLogout = async () => {
  logoutUser()
}

</script>
