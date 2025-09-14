<script setup lang="ts">
import { usePagesStore } from '../../stores/pages';
import { onMounted,ref } from 'vue';
import PagesList from '../../entities/page/PagesList.vue';

const pagesStore = usePagesStore()
const pages = ref()
const pagination = ref()

onMounted(async () => {
  await pagesStore.fetchPages();
  pages.value = pagesStore.pages;
  pagination.value = pagesStore.pagination;
})

</script>

<template>
  <div
    class="p-3"
  >
    <PagesList
      v-if="pages"
      :items="pages"
      :pagination="pagination"
    />
  </div>
  <RouterLink :to="{name:'pageNew'}">
    <Button
      aria-label="Search"
      rounded
      severity="secondary"
      :style="{ position: 'absolute', right: '1rem', bottom: '1rem' }"
      variant="outlined"
    >
      <img src="/ss-logo.svg"> добавить страницу
    </Button>
  </RouterLink>
</template>

