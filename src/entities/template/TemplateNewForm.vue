<script setup lang="ts">
import { ref } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { TemplateNew } from '../../types/Template.types';
import { useTemplatesStore } from '../../stores/templates.ts';
import getTemplateNewFields from './template-new.fields'

const emits = defineEmits(['submit'])

const templatesStore = useTemplatesStore()

const isLoading = ref(false)
const formFields = ref(getTemplateNewFields());
const formData = ref<TemplateNew>();
const formErrors = ref({})

const checkNameExists = async (name: string) => {
  const a = await templatesStore.templateExists(name)
  return Boolean(a)
}

const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  const name = values?.name
  if (!name) return

  const nameIsBusy = await checkNameExists(name)

  if (nameIsBusy) {
    formErrors.value = {
      ...formErrors.value,
      name:['Такое имя уже используется'],
    }
    return
  }

  try {
    emits('submit', values as TemplateNew)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Form
    class="flex flex-col gap-4 w-full sm:w-156"
    :validate-on-blur="true"
    :validate-on-value-update="true"
    @submit="onFormSubmit"
  >
    <ComControls
      :data="formData"
      :errors="formErrors"
      :fields="formFields"
    />

    <Button
      icon="pi pi-plus"
      label="Создать шаблон"
      type="submit"
    />
  </Form>
</template>