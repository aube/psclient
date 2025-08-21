<template>
  <div>
    <UserRegisterForm @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import UserRegisterForm from '../entities/user/UserRegisterForm.vue';
import { User } from '../types/User.types';

// import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user';

const { registerUser } = useUserStore()

const onSubmit = async (formData: User) => {
  await registerUser(formData)
}

</script>
