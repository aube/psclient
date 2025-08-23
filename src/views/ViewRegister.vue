<template>
  <div>
    <UserRegisterForm @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import UserRegisterForm from '../entities/user/UserRegisterForm.vue';
import { User } from '../types/User.types';
import { useUserStore } from '../stores/user';

import { useNotificationStore } from '../stores/notification'
const { registerUser } = useUserStore(useNotificationStore())

const onSubmit = async (formData: User) => {
  await registerUser(formData)
}

</script>
