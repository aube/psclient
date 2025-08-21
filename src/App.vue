<script setup lang="ts">
import ComNavbar from './components/ComNavbar.vue';
import Toast from 'primevue/toast';
import { onMounted, ref } from 'vue';
import { useUserStore } from './stores/user';
import { getWindowProperty } from './lib/utils'



import { useNotificationStore } from './stores/notification';
const notifications = useNotificationStore()

const userStore = useUserStore(notifications)
const currentUser = getWindowProperty('user')

const isToastLoaded = ref(false)



onMounted(() => {
  isToastLoaded.value = true
  // currentUser.value = userStore.currentUser()
})

</script>

<template>
  <main>
    <ComNavbar class="mb-3" />
    <RouterView />
    {{ currentUser }}
    <Toast v-if="isToastLoaded" />
  </main>
</template>

<style scoped>


</style>


