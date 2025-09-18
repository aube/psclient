<script setup lang="ts">
import { useTemplatesStore } from '../../stores/templates';
import { onMounted,ref } from 'vue';
import TemplatesList from '../../entities/template/TemplatesList.vue';

const templatesStore = useTemplatesStore()
const templates = ref()
const pagination = ref()

onMounted(async () => {
  await templatesStore.fetchTemplates();
  templates.value = templatesStore.templates;
  pagination.value = templatesStore.pagination;
})

</script>

<template>
  <div
    class="p-3"
  >
    <TemplatesList
      v-if="templates"
      :items="templates"
      :pagination="pagination"
    />
  </div>
  <RouterLink :to="{name:'templateNew'}">
    <Button
      aria-label="Search"
      rounded
      severity="secondary"
      :style="{ position: 'absolute', right: '1rem', bottom: '1rem' }"
      variant="outlined"
    >
      <img src="/ss-logo.svg"> добавить шаблон
    </Button>
  </RouterLink>
</template>

