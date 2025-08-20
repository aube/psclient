<template>
  <div>
    <UserLoginForm @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import UserLoginForm from '../entities/user/UserLoginForm.vue';
import { User } from '../types/User.types';


// import { useNotificationStore } from '@/stores/notification'
// import { useRestApi } from '../lib/restapi.js'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user';

// const { showSuccess, showDanger } = useNotificationStore()
// const { post } = useRestApi()
const router = useRouter()
const { loginUser } = useUserStore()


const onSubmit = async (formData: User) => {
  await loginUser(formData)

}


</script>
