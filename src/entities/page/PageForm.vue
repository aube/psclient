<script setup lang="ts">
import { ref } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { Page } from '../../types/Page.types';
import getPageFields from './page.fields'

const emits = defineEmits(['submit'])

const { page } = defineProps<{
  page: Page
}>()

const isLoading = ref(false)
const formFields = ref(getPageFields());

const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  const data = {
    ...values,
    id: page.id,
  }

  try {
    emits('submit', data as Page)
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
      :data="page"
      :fields="formFields"
    />

    <Button
      icon="pi pi-check"
      label="Сохранить страницу"
      type="submit"
    />
  </Form>
</template>