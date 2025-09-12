<script setup lang="ts">
import { User } from '../types/User.types';
import { useRouter } from 'vue-router'
import { useSitesStore } from '../stores/sites';
import { useUserStore } from '../stores/user';
import UserLoginForm from '../entities/user/UserLoginForm.vue';
import UserLogoutForm from '../entities/user/UserLogoutForm.vue';

const userStore = useUserStore()
const sitesStore = useSitesStore()

const router = useRouter()

const onSubmit = async (formData: User) => {
  const success = await userStore.loginUser(formData)
  if (success) {
    await sitesStore.fetchSites()
    router.push('/')
  }
}

const onLogout = async () => {
  userStore.logoutUser()
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

        <template v-if="!userStore.isAuthenticated">
          <div class="flex flex-col items-center gap-2 w-full">
            <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold leading-tight text-center w-full">
              Вход в систему
            </div>
          </div>

          <UserLoginForm
            @submit="onSubmit"
          />

          <div class="text-center w-full">
            <span class="text-surface-700 dark:text-surface-200 leading-normal">Вы ещё не зарегистрированы?</span>
            <RouterLink
              class="text-primary font-medium ml-1 cursor-pointer hover:text-primary-emphasis"
              to="/register"
            >
              Регистрация
            </RouterLink>
          </div>
        </template>

        <template v-else>
          <div class="flex flex-col items-center gap-2 w-full">
            <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold leading-tight text-center w-full">
              Выход есть
            </div>
          </div>

          <UserLogoutForm
            @submit="onLogout"
          />
        </template>
      </div>
    </div>
  </div>
</template>