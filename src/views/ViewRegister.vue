<script setup lang="ts">
import { User } from '../types/User.types';
import { useUserStore } from '../stores/user';
import { useNotificationStore } from '../stores/notification'
import UserRegisterForm from '../entities/user/UserRegisterForm.vue';

const userStore = useUserStore(useNotificationStore())

const onSubmit = async (formData: User) => {
  await userStore.registerUser(formData)
}
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-20 lg:px-80">
    <div class="bg-surface-0 dark:bg-surface-900 p-8 pt-4 md:p-12 md:pt-6 shadow-sm rounded-2xl w-full max-w-sm mx-auto flex flex-col gap-8">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-4">
          <ComLogo
            size="155"
          />
        </div>
        <div class="flex flex-col items-center gap-2 w-full">
          <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold leading-tight text-center w-full">
            Регистрация
          </div>
        </div>
      </div>

      <UserRegisterForm
        @submit="onSubmit"
      />

      <div class="text-center w-full">
        <span class="text-surface-700 dark:text-surface-200 leading-normal">Уже есть аккаунт?</span>
        <RouterLink
          class="text-primary font-medium ml-1 cursor-pointer hover:text-primary-emphasis"
          to="/login"
        >
          Вход в систему
        </RouterLink>
      </div>
    </div>
  </div>
</template>