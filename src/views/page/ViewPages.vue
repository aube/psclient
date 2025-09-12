<script setup lang="ts">
import { PagesList as IPL } from '../../types/Page.types.ts';
import { usePagesStore } from '../../stores/pages';
import { onMounted,ref, reactive } from 'vue';
import PagesList from '../../entities/page/PagesList.vue';

const pagesStore = usePagesStore()
const pages = ref()
pages.value = pagesStore.fetchPages();

</script>

<template>
  <PagesList
    :items="pages?.rows"
    :pagination="pages?.pagination"
  />

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

