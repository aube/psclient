<script setup lang="ts">
import { ref } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { Template } from '../../types/Template.types';
import { useTemplatesStore } from '../../stores/templates.ts';
import getTemplateFields from './template-new.fields'

const emits = defineEmits(['submit'])

const templatesStore = useTemplatesStore()
const { template } = defineProps<{
  template: Template
}>()

const isLoading = ref(false)
const formFields = ref(getTemplateFields());
const formErrors = ref({})

const checkNameExists = async (name: string) => {
  const a = await templatesStore.templateExists(name)
  if (!a) return false
  return a.id !== template.id
}


const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  const nameIsBusy = await checkNameExists(values.name)

  if (nameIsBusy) {
    formErrors.value = {
      ...formErrors.value,
      name:['Такое имя уже используется'],
    }
    return
  }

  const data = {
    ...values,
    id: template.id,
  }

  try {
    emits('submit', data as Template)
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
      :data="template"
      :errors="formErrors"
      :fields="formFields"
    />

    <Button
      icon="pi pi-check"
      label="Сохранить шаблон"
      type="submit"
    />
  </Form>
</template>