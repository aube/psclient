<script setup lang="ts">
import { TemplateNew } from '../../types/Template.types.ts';
import { useTemplatesStore } from '../../stores/templates';
import { useRouter } from 'vue-router'
import TemplateNewForm from '../../entities/template/TemplateNewForm.vue';

const templatesStore = useTemplatesStore()

const router = useRouter()

const onSubmit = async (formData: TemplateNew) => {
  const result = await templatesStore.createTemplate(formData)
  router.push({
    name: "template",
    params: {
      templateID: result?.id,
    }}
  )
}
</script>

<template>
  <div
    class="grid gap-4 p-3"
  >
    <TemplateNewForm
      @submit="onSubmit"
    />
  </div>
</template>