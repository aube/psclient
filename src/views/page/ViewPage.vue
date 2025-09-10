<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRestApi } from '../../lib/restapi.ts';
import { IPage } from '../../entities/page/page.ts';
import PageForm from '../../entities/page/PageForm.vue';

import { useRoute } from 'vue-router'

const route = useRoute()

const page = ref<IPage|null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const { get } = useRestApi();

const fetchPages = async () => {
  try {
    loading.value = true;
    const response = await get<IPage>('/page?id=' + route.params.id);
    if (response.data)
      page.value = response.data;

  } catch (err) {
    error.value = 'Ошибка при загрузке страницы';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPages();
});
</script>

<template>
  <PageForm
    :error="error"
    :loading="loading"
    :page="page"
  />
</template>