<script setup lang="ts">
import { User } from '../../types/User.types';
import { useUserStore } from '../../stores/user';
import { useNotificationStore } from '../../stores/notification'
import UserProfileForm from '../../entities/user/UserProfileForm.vue';
import UserLogoutForm from '../../entities/user/UserLogoutForm.vue';

const userStore = useUserStore(useNotificationStore())

const onSubmit = async (formData: User) => {
  // await updateUser(formData)
  // router.push('/')
}

const onLogout = async () => {
  userStore.logoutUser()
}
</script>

<template>
  <div
    class="p-3 flex flex-col gap-4 w-full sm:w-156"
  >
    <UserProfileForm
      @submit="onSubmit"
    />

    <UserLogoutForm
      class="mt-8"
      @submit="onLogout"
    />
  </div>
</template>