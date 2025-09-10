<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRestApi } from '../../lib/restapi.ts';
import { IPage, IPages } from '../../entities/page/page.ts';
import PagesList from '../../entities/page/PagesList.vue';


const pages = ref<IPage[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const { get } = useRestApi();

const fetchPages = async () => {
  try {
    loading.value = true;
    const response = await get<IPages>('/pages');
    if (response.data?.rows)
      pages.value = response.data.rows;

  } catch (err) {
    error.value = err instanceof Error ? err.message : (String(err) || 'Ошибка при загрузке страниц');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPages();
});
</script>

<template>
  <PagesList
    :error="error"
    :loading="loading"
    :pages="pages"
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

