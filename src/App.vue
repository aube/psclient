<script setup lang="ts">
import ComNavbar from './components/ComNavbar.vue';
import Toast from 'primevue/toast';
import { onMounted, ref } from 'vue';
import { useToast } from "primevue/usetoast";
import type { ToastServiceMethods } from 'primevue/toastservice';

import { useRestApi } from './lib/restapi';

let toast: ToastServiceMethods
const isToastLoaded = ref(false)

onMounted(() => {
  toast = useToast();
  isToastLoaded.value = true
  // setTimeout(save, 2000)
})

const save = () => {
  toast.add({
    severity:'success',
    summary: 'Success',
    detail: 'Data Saved',
    life: 3000,
  });
};

</script>

<template>
  <main>
    <ComNavbar class="mb-3" />
    <RouterView />

    <Toast v-if="isToastLoaded" />
  </main>
</template>

<style scoped>


</style>

