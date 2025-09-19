<script setup lang="ts">
import { useTemplatesStore } from '../../stores/templates';
import { onMounted, onUnmounted,ref } from 'vue';
import { useRouter } from 'vue-router'
import { useGeneralStore } from '../../stores/general'
import TemplatesList from '../../entities/template/TemplatesList.vue';

const router = useRouter()

const generalStore = useGeneralStore()
const templatesStore = useTemplatesStore()
const templates = ref()
const pagination = ref()

const fetchTemplates = async () => {
  await templatesStore.fetchTemplates();
  templates.value = templatesStore.templates;
  pagination.value = templatesStore.pagination;
}

function setButtons() {
  generalStore.setActionButtons([
    {
      ariaLabel: "Add template",
      label: "Add template",
      icon: "pi pi-plus",
      severity: "primary",
      click: () => router.push(
        { name:'templateNew' }
      ),
    },
  ])
}

onMounted(async () => {
  fetchTemplates()
  setButtons()
})

onUnmounted(() => {
  generalStore.setActionButtons([])
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
</template>

