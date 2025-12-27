<script setup lang="ts">
import ComNavbar from './components/ComNavbar.vue';

// import Toast from 'primevue/toast';
// import { onMounted, ref } from 'vue';
// import { User } from './types/User.types';
// import { useUserStore } from './stores/user';
// import { useGeneralStore } from './stores/general.js'
import { usePagesStore } from './stores/pages.js'
// import { useTemplatesStore } from './stores/templates.js'

// useGeneralStore()

const pagesStore = usePagesStore()
pagesStore.fetchPages()

// const templatesStore = useTemplatesStore()
// templatesStore.fetchTemplates()


</script>

<template>
  <header>
    <ComNavbar />
  </header>
  <main>
    <RouterView />
  </main>

  <footer>
    <!-- {{ pagesStore.pages }} -->
  </footer>
</template>
