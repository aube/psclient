<script setup lang="ts">
import ComNavbar from './components/ComNavbar.vue';
import Toast from 'primevue/toast';
import { onMounted, ref } from 'vue';
import { User } from './types/User.types';
import { useUserStore } from './stores/user';
import { useGeneralStore } from './stores/general.js'
import { useNotificationStore } from './stores/notification';

useGeneralStore()
const notifications = useNotificationStore()
const userStore = useUserStore(notifications)

const isToastLoaded = ref(false)
const iAm = ref<User | null>(null)
iAm.value = userStore.currentUser() as User

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
