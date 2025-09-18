<script setup lang="ts">
import { Template } from '../../types/Template.types.ts';
import { useTemplatesStore } from '../../stores/templates';
import { useRouter, useRoute } from 'vue-router'
import TemplateForm from '../../entities/template/TemplateForm.vue';
import { ref, onMounted } from 'vue'

const templatesStore = useTemplatesStore()

const router = useRouter()
const route = useRoute()

const template = ref<Template | null>(null)

const onSubmit = async (formData: Template) => {
  const result = await templatesStore.updateTemplate(formData)
  router.push({
    name: "template",
    params: {
      templateID: result?.id,
    }}
  )
}

onMounted(async () => {
  template.value = await templatesStore.getTemplate(Number(route.params.templateID))
})
</script>

<template>
  <div
    class="grid gap-4 p-3"
  >
    <TemplateForm
      v-if="template"
      :template="template"
      @submit="onSubmit"
    />
  </div>
</template>