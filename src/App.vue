<script setup lang="ts">
import ComNavbar from './components/ComNavbar.vue';
import Toast from 'primevue/toast';
import { onMounted, ref } from 'vue';
import { useUserStore } from './stores/user';
import { User } from './types/User.types';

import { useNotificationStore } from './stores/notification';
const notifications = useNotificationStore()

const userStore = useUserStore(notifications)
const isToastLoaded = ref(false)
const currentUser = ref<User | null>(null)
currentUser.value = userStore.currentUser() as User

onMounted(() => {
  isToastLoaded.value = true
})

</script>

<template>
  <main>
    <ComNavbar
      v-if="userStore.isAuthenticated"
      class="mb-3"
    />

    <RouterView />

    <Toast v-if="isToastLoaded" />
  </main>
</template>


<style scoped></style>
